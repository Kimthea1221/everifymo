from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.models.users import User
from app.desktop.schemas.auth.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyResetOtpRequest,
)
from app.desktop.services.auth.otp_service import create_otp_for_user, verify_otp_for_user
from app.desktop.services.auth.email import send_superadmin_otp_email
from app.core.security import hash_password

router = APIRouter(prefix="/auth/password", tags=["auth-password"])


@router.post("/forgot")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If an account exists for this email, an OTP was sent."}

    otp = create_otp_for_user(db, user)
    await send_superadmin_otp_email(user.email, otp)

    return {"message": "If an account exists for this email, an OTP was sent."}


@router.post("/verify-otp")
def verify_reset_otp(payload: VerifyResetOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    try:
        verify_otp_for_user(db, user, payload.otp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": "OTP verified"}


@router.post("/reset")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")

    try:
        otp_token = verify_otp_for_user(db, user, payload.otp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    user.password_hash = hash_password(payload.new_password)
    user.force_password_change = False
    otp_token.is_used = True
    db.commit()

    return {"message": "Password updated"}