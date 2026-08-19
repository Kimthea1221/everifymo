# backend/app/desktop/services/auth/personnel_auth.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone

from backend.app.models.users import User
from backend.app.core.security import verify_password
from backend.app.core.constants import Role
from backend.app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from backend.app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType


AGENCY_ROLE_MAP = {
    "fda": Role.FDA_PERSONNEL,
    "lea": Role.LEA_PERSONNEL,
}


def authenticate_personnel(
    db: Session,
    email: str,
    password: str,
    agency: str,
) -> User:

    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise ValueError("Invalid credentials")

    expected_role = AGENCY_ROLE_MAP.get(agency)
    if expected_role is None:
        raise ValueError("Invalid agency selection")

    if user.role != expected_role:
        raise ValueError("Access Denied: Make sure you select the correct agency to sign in.")

    if user.status != "active":
        raise ValueError("Your account is not yet active. Please contact your administrator.")

    if not user.is_active:
        raise ValueError("Account is suspended.")

    if user.is_locked:
        raise ValueError("Account is locked. Please contact your administrator.")

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        just_locked = False
        if user.failed_login_attempts >= 5:
            user.is_locked = True
            just_locked = True
        db.commit()

        if just_locked:
            notification_service.create_notification_for_all_superadmins(
                db=db,
                event_type=NotificationEventType.ACCOUNT_LOCKED,
                title="Account locked out",
                message=f"{user.email} has been locked out after {user.failed_login_attempts} failed login attempts.",
                related_user_id=user.user_id,
            )
        elif user.failed_login_attempts == 3:
            notification_service.create_notification_for_all_superadmins(
                db=db,
                event_type=NotificationEventType.FAILED_LOGIN_WARNING,
                title="Repeated failed login attempts",
                message=f"{user.failed_login_attempts} failed attempts on {user.email}.",
                related_user_id=user.user_id,
            )

        raise ValueError("Invalid credentials")

    user.failed_login_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    return user