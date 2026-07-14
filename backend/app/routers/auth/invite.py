import uuid
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.sessions import get_db
from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.schemas.auth.invite import InvitePersonnelRequest
from app.services.auth.invite import create_invited_user
from app.services.auth.email import send_invite_email
from app.core.dependencies import get_current_superadmin

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.post("/invite", status_code=201)
async def invite_personnel(payload: InvitePersonnelRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(400, "A user with this email already exists.")

    db_role = {
        "FDA": "fda_personnel",
        "LEA-CIDG": "lea_personnel",
    }.get(payload.role, payload.role)

    user, token = create_invited_user(
        db, payload.email, payload.region_id, db_role,
        created_by=None,
    )

    await send_invite_email(user.email, payload.role, token)

    return {"message": "Registration link sent", "user_id": str(user.user_id)}


@router.post("/invite", status_code=201)
async def invite_personnel(
    payload: InvitePersonnelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superadmin),
):
    existing = db.query(User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(400, "A user with this email already exists.")

    user, token = create_invited_user(
        db, payload.email, payload.region_id, payload.role,
        created_by=current_user.user_id,   # ← now correctly populated
    )

    await send_invite_email(user.email, payload.role, token)

    return {"message": "Registration link sent", "user_id": str(user.user_id)}


