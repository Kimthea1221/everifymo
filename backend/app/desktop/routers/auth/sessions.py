from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.database.sessions import get_db
from app.models.user_sessions import UserSession
from app.core.security import hash_refresh_token, create_desktop_access_token, generate_refresh_token
from app.core.config import settings

router = APIRouter(prefix="/auth/token", tags=["auth-token"])


@router.post("/refresh")
def refresh_token(payload: dict, db: Session = Depends(get_db), request: Request = None):
    token = payload.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token required")

    token_hash = hash_refresh_token(token)

    session = (
        db.query(UserSession)
        .filter(UserSession.refresh_token_hash == token_hash)
        .first()
    )

    if not session or session.is_revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expired")

    # rotate refresh token
    new_refresh = generate_refresh_token()
    session.refresh_token_hash = hash_refresh_token(new_refresh)
    session.last_used_at = datetime.now(timezone.utc)
    session.expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    access_token = create_desktop_access_token({"sub": str(session.user_id)})

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh}


@router.post("/revoke")
def revoke_token(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token required")

    token_hash = hash_refresh_token(token)
    session = db.query(UserSession).filter(UserSession.refresh_token_hash == token_hash).first()
    if not session:
        return {"message": "ok"}

    session.is_revoked = True
    db.commit()

    return {"message": "ok"}