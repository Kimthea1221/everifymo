# app/routers/auth/password_change.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, hash_password
from app.models.users import User
from app.desktop.schemas.auth.password_change import ChangePasswordRequest
from app.desktop.services.superadmin_notifications import superadmin_notification_service as notification_service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType

router = APIRouter(prefix="/auth/password", tags=["auth-password"])


@router.post("/change")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.execute(text("SET app.bypass_rls = 'true'"))
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    current_user.password_hash = hash_password(payload.new_password)
    current_user.force_password_change = False
    db.commit()

    notification_service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.PASSWORD_CHANGED,
        title="First-login password change completed",
        message=f"{current_user.email} completed the required first-login password change.",
        related_user_id=current_user.user_id,
    )

    return {"message": "Password changed successfully."}