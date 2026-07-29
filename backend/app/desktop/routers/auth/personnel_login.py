from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.sessions import get_db
from app.desktop.schemas.auth.personnel_login import PersonnelLoginRequest, PersonnelOTPVerifyRequest
from app.desktop.services.auth.personnel_auth import authenticate_personnel
from app.desktop.services.auth.otp_service import create_otp_for_user, verify_otp_for_user
from app.desktop.services.auth.email import send_personnel_otp_email
from app.models.users import User
from app.core.security import create_access_token, generate_refresh_token, hash_refresh_token
from app.models.user_sessions import UserSession
from app.core.config import settings
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/auth", tags=["personnel-auth"])


@router.post("/login")
async def personnel_login(request: PersonnelLoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_personnel(db, request.email, request.password, request.agency)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    otp = create_otp_for_user(db, user)
    await send_personnel_otp_email(user.email, otp)

    return {"message": "OTP sent"}


@router.post("/verify-otp")
def verify_personnel_otp(request: PersonnelOTPVerifyRequest, db: Session = Depends(get_db)):
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    try:
        otp_token = verify_otp_for_user(db, user, request.otp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    otp_token.is_used = True
    db.commit()

    access_token = create_access_token({"sub": str(user.user_id), "role": user.role})

    refresh_token = generate_refresh_token()
    refresh_hash = hash_refresh_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    session = UserSession(
        user_id=user.user_id,
        refresh_token_hash=refresh_hash,
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "role": user.role,
        "force_password_change": user.force_password_change,
    }