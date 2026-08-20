# backend/app/desktop/routers/admin_management/management.py        
import uuid
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.audit import write_audit_log, get_user_region_code
from app.core.constants import AuditAction

from app.database.sessions import get_db
from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.desktop.schemas.admin_management.management import (
    SuperadminListItem,
    SuperadminSummary,
    InviteSuperadminRequest,
)
from app.core.constants import UserStatus
from app.core.dependencies import get_current_superadmin
from app.desktop.services.auth.email import send_invite_email
from app.desktop.services.auth.email import send_superadmin_invite_email
from app.desktop.services.admin_management.invite import create_invited_superadmin
from app.desktop.services.admin_management.invite import activate_superadmin
from app.desktop.services.auth.email import send_superadmin_activation_email
from app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType

router = APIRouter(prefix="/admin/superadmins", tags=["superadmin-management"])


def compute_admin_status(user: User, latest_token) -> str:
    if user.is_locked:
        return "Locked"
    if user.status == UserStatus.INVITED:
        if latest_token:
            if latest_token.resend_requested_at is not None:
                return "Resend Requested"
            expires_at = latest_token.expires_at
            if expires_at:
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < datetime.now(timezone.utc):
                    return "Link Expired"
        return "Invited"
    if user.status == UserStatus.PENDING_APPROVAL:
        return "Pending Approval"
    if user.status == UserStatus.ACTIVE:
        return "Active" if user.is_active else "Suspended"
    return user.status


@router.get("", response_model=list[SuperadminListItem])
def list_superadmins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))

    admins = db.query(User).filter(User.role == "superadmin").all()
    if not admins:
        return []

    admin_ids = [a.user_id for a in admins]
    tokens = (
        db.query(AccountInvitationToken)
        .filter(AccountInvitationToken.user_id.in_(admin_ids))
        .order_by(AccountInvitationToken.created_at.asc())
        .all()
    )
    tokens_map = {t.user_id: t for t in tokens}

    result = []
    for admin in admins:
        latest_token = tokens_map.get(admin.user_id)
        result.append(
            SuperadminListItem(
                admin_id=admin.user_id,
                email=admin.email,
                invitation_date=latest_token.created_at if latest_token else None,
                expiration_date=latest_token.expires_at if latest_token else None,
                status=compute_admin_status(admin, latest_token),
                is_locked=admin.is_locked,
            )
        )
    return result


@router.get("/summary", response_model=SuperadminSummary)
def superadmin_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    base = db.query(User).filter(User.role == "superadmin")

    total = base.count()
    active = base.filter(User.status == UserStatus.ACTIVE, User.is_active == True).count()
    suspended = base.filter(User.status == UserStatus.ACTIVE, User.is_active == False).count()

    invited_admins = base.filter(User.status == UserStatus.INVITED).all()
    invited_count = 0
    expired_count = 0
    if invited_admins:
        ids = [a.user_id for a in invited_admins]
        tokens = (
            db.query(AccountInvitationToken)
            .filter(AccountInvitationToken.user_id.in_(ids))
            .order_by(AccountInvitationToken.created_at.asc())
            .all()
        )
        tokens_map = {t.user_id: t for t in tokens}
        for a in invited_admins:
            status = compute_admin_status(a, tokens_map.get(a.user_id))
            if status == "Link Expired":
                expired_count += 1
            else:
                invited_count += 1

    return SuperadminSummary(
        total_admins=total,
        active=active,
        invited=invited_count,
        invitation_expired=expired_count,
        suspended=suspended,
    )


@router.post("/invite", status_code=201)
async def invite_superadmin(
    payload: InviteSuperadminRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    existing = db.query(User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(400, "A user with this email already exists.")

    admin, token = create_invited_superadmin(
        db, payload.email, created_by=current_user.user_id, request=http_request
    )

    await send_superadmin_invite_email(admin.email, token)

    return {"message": "Superadmin invitation sent", "admin_id": str(admin.user_id)}


@router.post("/{admin_id}/resend")
async def resend_superadmin_invitation(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(User.user_id == admin_id, User.role == "superadmin").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found")
    if admin.status != UserStatus.INVITED:
        raise HTTPException(status_code=400, detail="Cannot resend invite for an admin who is not in invited status")

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=2)

    new_token = AccountInvitationToken(
        user_id=admin.user_id,
        invite_token=token,
        expires_at=expires,
        resend_requested_at=None,
    )
    db.add(new_token)
    db.commit()

    await send_superadmin_invite_email(admin.email, token)

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.RESEND_LINK_REQUESTED,
        title="Invitation resent",
        message=f"Invitation resent to {admin.email}.",
        related_user_id=admin.user_id,
    )

    write_audit_log(
        db,
        user=current_user,
        action=AuditAction.INVITE_SUPERADMIN_RESENT,
        target_table="users",
        target_id=admin.user_id,
        target_reference=admin.email,
        request=http_request,
        region_code=None,
        user_role_override="superadmin",
    )

    return {"message": "Invitation resent successfully"}


@router.post("/{admin_id}/suspend")
def suspend_superadmin(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    if admin_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot suspend your own account.")

    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(User.user_id == admin_id, User.role == "superadmin").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found")
    admin.is_active = False
    db.commit()

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.ACCOUNT_SUSPENDED,
        title="Superadmin suspended",
        message=f"{admin.email}'s superadmin account has been suspended.",
        related_user_id=admin.user_id,
    )

    write_audit_log(
        db,
        user=current_user,
        action=AuditAction.SUSPEND_SUPERADMIN_ACCOUNT,
        target_table="users",
        target_id=admin.user_id,
        target_reference=admin.email,
        request=http_request,
        region_code=None,
        user_role_override="superadmin",
    )

    return {"message": "Superadmin account suspended successfully"}


@router.post("/{admin_id}/reactivate")
def reactivate_superadmin(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(User.user_id == admin_id, User.role == "superadmin").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found")
    admin.is_active = True
    db.commit()

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.ACCOUNT_REACTIVATED,
        title="Superadmin reactivated",
        message=f"{admin.email}'s superadmin account has been reactivated.",
        related_user_id=admin.user_id,
    )

    write_audit_log(
        db,
        user=current_user,
        action=AuditAction.REACTIVATE_SUPERADMIN_ACCOUNT,
        target_table="users",
        target_id=admin.user_id,
        target_reference=admin.email,
        request=http_request,
        region_code=None,
        user_role_override="superadmin",
    )

    return {"message": "Superadmin account reactivated successfully"}


@router.delete("/{admin_id}")
def delete_superadmin(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    if admin_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")

    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(User.user_id == admin_id, User.role == "superadmin").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found")

    if not (admin.status == UserStatus.ACTIVE and not admin.is_active):
        raise HTTPException(status_code=400, detail="Only suspended superadmins can be deleted.")

    deleted_admin_id = admin.user_id
    deleted_admin_email = admin.email

    db.query(AccountInvitationToken).filter(AccountInvitationToken.user_id == admin_id).delete()
    db.delete(admin)
    db.commit()

    write_audit_log(
        db,
        user=current_user,
        action=AuditAction.DELETE_SUPERADMIN_ACCOUNT,
        target_table="users",
        target_id=deleted_admin_id,
        target_reference=deleted_admin_email,
        request=http_request,
        region_code=None,
        user_role_override="superadmin",
    )

    return {"message": "Superadmin deleted successfully"}



@router.post("/{admin_id}/activate")
async def activate_superadmin_endpoint(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    admin = activate_superadmin(db, admin_id, activated_by=current_user, request=http_request)
    await send_superadmin_activation_email(admin.email)
    return {"message": "Superadmin account activated."}


@router.post("/{admin_id}/unlock")
def unlock_superadmin(
    admin_id: uuid.UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(User.user_id == admin_id, User.role == "superadmin").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found")
    admin.is_locked = False
    admin.failed_login_attempts = 0
    db.commit()

    write_audit_log(
        db,
        user=current_user,
        action=AuditAction.UNLOCK_SUPERADMIN_ACCOUNT,
        target_table="users",
        target_id=admin.user_id,
        target_reference=admin.email,
        request=http_request,
        region_code=None,
        user_role_override="superadmin",
    )

    return {"message": "Superadmin account unlocked successfully"}