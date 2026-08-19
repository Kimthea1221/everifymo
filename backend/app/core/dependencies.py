# app/core/dependencies.py
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.database.sessions import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.users import User


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user_id = payload.get("sub")
    db.execute(text("SET app.bypass_rls = 'true'"))
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    if user.role == "superadmin":
        db.execute(text("SET app.bypass_rls = 'true'"))
    else:
        db.execute(text("SET app.bypass_rls = 'false'"))
        region_id_str = str(user.region_id) if user.region_id else ""
        db.execute(text(f"SET app.current_region_id = '{region_id_str}'"))

    return user


def get_current_superadmin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin access required.")
    return current_user