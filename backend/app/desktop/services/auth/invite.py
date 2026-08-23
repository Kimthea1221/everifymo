import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType


def create_invited_user(db: Session, email: str, region_id, role: str, created_by):
    db.execute(text("SET app.bypass_rls = 'true'"))

    user = User(
        email=email,
        region_id=region_id,
        role=role,
        created_by=created_by,
    )
    db.add(user)
    db.flush()

    # Capture what we need while the object is still fully populated,
    # before commit() expires its attributes.
    user_id = user.user_id
    user_email = user.email

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=2)

    invite = AccountInvitationToken(
        user_id=user_id,
        invite_token=token,
        expires_at=expires,
    )
    db.add(invite)
    db.commit()
    # no db.refresh(user), no user.<anything> reads past this point

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.PERSONNEL_INVITED,
        title="New personnel invited",
        message=f"{user_email} was invited as new {role.replace('_', ' ')}.",
        related_user_id=user_id,
    )

    return user_id, token