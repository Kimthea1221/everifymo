from pydantic import BaseModel, EmailStr, constr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=4)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=4)
    new_password: constr(min_length=8)

