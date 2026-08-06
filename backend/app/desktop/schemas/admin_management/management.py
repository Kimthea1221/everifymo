from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class InviteSuperadminRequest(BaseModel):
    email: EmailStr


class SuperadminListItem(BaseModel):
    admin_id: uuid.UUID
    email: EmailStr
    invitation_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class SuperadminSummary(BaseModel):
    total_admins: int
    active: int
    invited: int
    invitation_expired: int
    suspended: int