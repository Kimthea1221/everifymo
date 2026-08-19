import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from backend.app.database.sessions import get_db
from backend.app.desktop.services.admin_management.invite import (
    complete_superadmin_registration,
    request_new_superadmin_invite,
)
from backend.app.desktop.services.auth.email import send_superadmin_invite_email

router = APIRouter(tags=["superadmin-invite-public"])


class CreatePasswordFromInviteRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        from app.core.security import validate_password_strength as validate_strength
        return validate_strength(v)


class RequestNewInviteRequest(BaseModel):
    token: str


@router.post("/auth/password/create-from-invite")
async def create_password_from_invite(
    payload: CreatePasswordFromInviteRequest,
    db: Session = Depends(get_db),
):
    complete_superadmin_registration(db, payload.token, payload.new_password)
    return {"message": "Password created successfully."}


@router.post("/superadmin/invite/request-new")
async def request_new_invite(
    payload: RequestNewInviteRequest,
    db: Session = Depends(get_db),
):
    user, new_token = request_new_superadmin_invite(db, payload.token)
    await send_superadmin_invite_email(user.email, new_token)
    return {"message": "A new invitation has been sent."}