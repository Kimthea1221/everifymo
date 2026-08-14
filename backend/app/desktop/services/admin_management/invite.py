import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.core.constants import UserStatus
from app.core.security import hash_password

from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken


def create_invited_superadmin(db: Session, email: str, created_by) -> tuple[User, str]:
    db.execute(text("SET app.bypass_rls = 'true'"))

    user = User(
        email=email,
        region_id=None,  # superadmins aren't region-scoped
        role="superadmin",
        created_by=created_by,
    )
    db.add(user)
    db.flush()

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=2)

    invite = AccountInvitationToken(
        user_id=user.user_id,
        invite_token=token,
        expires_at=expires,
    )
    db.add(invite)
    db.commit()
    db.refresh(user)

    return user, token



def _resolve_token_status(invite: AccountInvitationToken) -> str:
    if invite.used_at is not None:
        return "used"
    expires_at = invite.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return "expired"
    return "valid"


def complete_superadmin_registration(db: Session, token: str, new_password: str) -> User:
    db.execute(text("SET app.bypass_rls = 'true'"))
    invite = (
        db.query(AccountInvitationToken)
        .filter(AccountInvitationToken.invite_token == token)
        .first()
    )
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invitation link.")

    token_status = _resolve_token_status(invite)
    if token_status == "used":
        raise HTTPException(status_code=400, detail="This invitation has already been used.")
    if token_status == "expired":
        raise HTTPException(status_code=400, detail="This invitation has expired.")

    user = db.query(User).filter(User.user_id == invite.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Associated account not found.")

    user.password_hash = hash_password(new_password)
    user.status = UserStatus.PENDING_APPROVAL
    user.is_active = False
    user.force_password_change = False
    invite.used_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)
    return user


def request_new_superadmin_invite(db: Session, old_token: str) -> tuple[User, str]:
    db.execute(text("SET app.bypass_rls = 'true'"))
    invite = (
        db.query(AccountInvitationToken)
        .filter(AccountInvitationToken.invite_token == old_token)
        .first()
    )
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    user = db.query(User).filter(User.user_id == invite.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Associated account not found.")

    if user.status != UserStatus.INVITED:
        raise HTTPException(status_code=400, detail="This account is no longer awaiting invitation.")

    new_token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=2)

    new_invite = AccountInvitationToken(
        user_id=user.user_id,
        invite_token=new_token,
        expires_at=expires,
    )
    db.add(new_invite)
    db.commit()

    return user, new_token

# Replace approve_superadmin() in services/admin_management/invite.py with this:

def activate_superadmin(db: Session, admin_id) -> User:
    db.execute(text("SET app.bypass_rls = 'true'"))
    admin = db.query(User).filter(
        User.user_id == admin_id, User.role == "superadmin"
    ).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Superadmin not found.")
    if admin.status != UserStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="This account is not awaiting activation.")

    admin.status = UserStatus.ACTIVE
    admin.is_active = True
    db.commit()
    db.refresh(admin)
    return admin