import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType


def create_invited_user(db: Session, email: str, region_id, role: str, created_by) -> tuple[User, str]:
    db.execute(text("SET app.bypass_rls = 'true'"))  # superadmin action — not region-scoped

    user = User(
        email=email,
        region_id=region_id,
        role=role,
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

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.PERSONNEL_INVITED,
        title="New personnel invited",
        message=f"{user.email} was invited as new {role.replace('_', ' ')}.",
        related_user_id=user.user_id,
    )

    return user, token