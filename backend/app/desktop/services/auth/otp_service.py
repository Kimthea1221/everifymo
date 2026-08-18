import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.otp_tokens import OTPToken
from app.models.users import User
from app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType


def generate_otp() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(settings.OTP_LENGTH))


def create_otp_for_user(db: Session, user: User) -> str:
    """Generates a fresh OTP, invalidates old ones, stores hash, returns plain OTP to send by email."""
    otp = generate_otp()

    # invalidate previous unused OTPs for this user
    db.query(OTPToken).filter(
        OTPToken.user_id == user.user_id,
        OTPToken.is_used.is_(False),
    ).update({"is_used": True})

    otp_token = OTPToken(
        user_id=user.user_id,
        otp_hash=hash_password(otp),  # reuse bcrypt hashing, don't store plaintext
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    )
    db.add(otp_token)
    db.commit()

    return otp


def verify_otp_for_user(db: Session, user: User, otp: str) -> OTPToken:
    """
    Returns the matching OTPToken if valid, else raises ValueError with a reason.
    Caller is responsible for marking it used once fully consumed (e.g. after password reset).

    Tracks cumulative failed OTP attempts on the User (persists across OTP re-requests)
    and locks the account (is_locked=True) once it reaches 5.
    """
    if user.is_locked:
        raise ValueError("Account is locked. Please contact your administrator.")

    otp_token = (
        db.query(OTPToken)
        .filter(OTPToken.user_id == user.user_id, OTPToken.is_used.is_(False))
        .order_by(OTPToken.created_at.desc())
        .first()
    )

    if not otp_token:
        raise ValueError("No active OTP found. Please request a new one.")

    if otp_token.expires_at < datetime.now(timezone.utc):
        raise ValueError("OTP has expired. Please request a new one.")

    if otp_token.attempt_count >= settings.OTP_MAX_ATTEMPTS:
        otp_token.is_used = True
        db.commit()
        raise ValueError("Too many failed attempts. Please request a new OTP.")

    if not verify_password(otp, otp_token.otp_hash):
        otp_token.attempt_count += 1
        user.failed_otp_attempts += 1

        just_locked = False
        if user.failed_otp_attempts >= 5 and not user.is_locked:
            user.is_locked = True
            just_locked = True

        db.commit()

        if just_locked:
            notification_service.create_notification_for_all_superadmins(
                db=db,
                event_type=NotificationEventType.ACCOUNT_LOCKED,
                title="Account locked out",
                message=f"{user.email} has been locked out after {user.failed_otp_attempts} failed OTP attempts.",
                related_user_id=user.user_id,
            )
            raise ValueError("Too many failed OTP attempts. Your account has been locked. Please contact your administrator.")

        if user.failed_otp_attempts == 3:
            notification_service.create_notification_for_all_superadmins(
                db=db,
                event_type=NotificationEventType.FAILED_LOGIN_WARNING,
                title="Repeated failed OTP attempts",
                message=f"{user.failed_otp_attempts} failed OTP attempts on {user.email}.",
                related_user_id=user.user_id,
            )

        raise ValueError("Invalid OTP.")

    # correct OTP — reset the cumulative failure counter
    if user.failed_otp_attempts != 0:
        user.failed_otp_attempts = 0
        db.commit()

    return otp_token