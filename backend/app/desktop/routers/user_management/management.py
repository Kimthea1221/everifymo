import uuid
import secrets
import secrets as secrets_module 
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.sessions import get_db
from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.desktop.schemas.user_management.management import UserListItem, UserSummary
from app.core.constants import UserStatus
from app.core.dependencies import get_current_superadmin
from app.core.security import hash_password
from app.desktop.services.auth.email import send_activation_email

router = APIRouter(prefix="/admin/users", tags=["user-management"])


def compute_display_status(user: User, latest_token) -> str:
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
        if not user.is_active:
            return "Suspended"
        return "Active"
    return user.status


@router.get("", response_model=list[UserListItem])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))

    users = db.query(User).filter(User.role != "superadmin").all()

    result = []
    for user in users:
        latest_token = (
            db.query(AccountInvitationToken)
            .filter(AccountInvitationToken.user_id == user.user_id)
            .order_by(AccountInvitationToken.created_at.desc())
            .first()
        )

        parts = [p for p in [user.first_name, user.middle_name, user.last_name] if p]
        fullname = " ".join(parts) if parts else None

        result.append(
            UserListItem(
                user_id=user.user_id,
                fullname=fullname,
                first_name=user.first_name,
                last_name=user.last_name,
                employee_id=user.employee_id,
                email=user.email,
                department=user.department,
                position=user.position,
                contact_number=user.contact_number,
                display_status=compute_display_status(user, latest_token),
                is_active=user.is_active,
            )
        )

    return result


@router.get("/summary", response_model=UserSummary)
def user_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))

    base_query = db.query(User).filter(User.role != "superadmin")

    total = base_query.count()
    active = base_query.filter(User.status == UserStatus.ACTIVE, User.is_active == True).count()
    pending_approval = base_query.filter(User.status == UserStatus.PENDING_APPROVAL).count()
    suspended = base_query.filter(User.status == UserStatus.ACTIVE, User.is_active == False).count()

    invited_users = base_query.filter(User.status == UserStatus.INVITED).all()
    invited_count = 0
    invite_requested_count = 0
    for u in invited_users:
        latest_token = (
            db.query(AccountInvitationToken)
            .filter(AccountInvitationToken.user_id == u.user_id)
            .order_by(AccountInvitationToken.created_at.desc())
            .first()
        )
        if latest_token and latest_token.resend_requested_at is not None:
            invite_requested_count += 1
        else:
            invited_count += 1

    return UserSummary(
        total_users=total,
        active=active,
        invited=invited_count,
        pending_approval=pending_approval,
        suspended=suspended,
        invite_requested=invite_requested_count,
    )


def generate_temp_password() -> str:
    # readable, still random: e.g. "Xk7-Rp2-Qw9!"
    return secrets_module.token_urlsafe(9) + "!A1"


@router.post("/{user_id}/activate")
async def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    temp_password = generate_temp_password()
    user.password_hash = hash_password(temp_password)
    user.force_password_change = True
    user.status = UserStatus.ACTIVE
    user.is_active = True
    db.commit()

    fullname = " ".join(p for p in [user.first_name, user.middle_name, user.last_name] if p)
    await send_activation_email(user.email, fullname or user.email, temp_password)

    return {"message": "User account activated successfully"}


@router.post("/{user_id}/suspend")
def suspend_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User account suspended successfully"}


@router.post("/{user_id}/reactivate")
def reactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User account reactivated successfully"}


@router.post("/{user_id}/resend")
async def resend_invitation(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status != UserStatus.INVITED:
        raise HTTPException(status_code=400, detail="Cannot resend invite for a user who is not in invited status")

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=2)

    new_token = AccountInvitationToken(
        user_id=user.user_id,
        invite_token=token,
        expires_at=expires,
        resend_requested_at=None,
    )
    db.add(new_token)
    db.commit()

    friendly_role = {
        "fda_personnel": "FDA",
        "lea_personnel": "LEA-CIDG"
    }.get(user.role, user.role)

    from app.desktop.services.auth.email import send_invite_email
    await send_invite_email(user.email, friendly_role, token)

    return {"message": "Invitation resent successfully"}


@router.delete("/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not (user.status == UserStatus.ACTIVE and not user.is_active):
        raise HTTPException(status_code=400, detail="Only suspended users can be deleted.")

    db.query(AccountInvitationToken).filter(AccountInvitationToken.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}