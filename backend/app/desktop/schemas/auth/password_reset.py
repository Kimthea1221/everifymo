from pydantic import BaseModel, EmailStr, constr, field_validator
from app.core.security import validate_password_strength


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=4)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=4)
    new_password: str
<<<<<<< HEAD
=======

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return validate_password_strength(v)
>>>>>>> origin/dev

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return validate_password_strength(v)
