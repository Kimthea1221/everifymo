from pydantic import BaseModel, EmailStr


class SuperAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SuperAdminOTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str