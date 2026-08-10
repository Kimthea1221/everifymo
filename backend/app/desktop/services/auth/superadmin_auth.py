from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.users import User
from app.core.security import verify_password
from app.core.constants import UserStatus

def authenticate_superadmin(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise ValueError("Invalid credentials")

    if user.role != "superadmin":
        raise ValueError("Superadmin access required")

    if user.status == UserStatus.PENDING_APPROVAL:
        raise ValueError("Your account is awaiting activation from a fellow Superadmin.")

    if not user.is_active:
        raise ValueError("Account is inactive")

    if user.is_locked:
        raise ValueError("Account is locked")

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        db.commit()
        raise ValueError("Invalid credentials")

    user.failed_login_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    return user