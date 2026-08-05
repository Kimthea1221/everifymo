from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid


class ProfileResponse(BaseModel):
    user_id: uuid.UUID
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    employee_id: Optional[str] = None
    email: EmailStr
    contact_number: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    role: str
    agency: str  # derived display label from role
    region: Optional[str] = None  # derived from Region.region_name

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str