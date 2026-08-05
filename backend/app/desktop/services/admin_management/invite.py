import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text

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