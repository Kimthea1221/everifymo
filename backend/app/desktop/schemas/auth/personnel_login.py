from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class PersonnelLoginRequest(BaseModel):
    email: EmailStr
    password: str
    agency: Literal["fda", "lea"]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: Optional[str] = "gps"


class PersonnelOTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: Optional[str] = "gps"