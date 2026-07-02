from dataclasses import EmailStr, Field

from pydantic import BaseModel
from uuid import UUID


class ValidateTokenResponse(BaseModel):   
    email: str                         
    role: str
    region_id: UUID | None
    region_name: str | None        


class RegistrationCompleteRequest(BaseModel):
    invite_token: str

    first_name: str = Field(..., min_length=1, max_length=100)               
    last_name: str = Field(..., min_length=1, max_length=100)
    position: str = Field(..., min_length=1, max_length=100)

    middle_name: str | None = Field(None, max_length=100)   
    employee_id: str | None = Field(None, max_length=50)
    contact_number: str | None = Field(None, max_length=20)
    department: str | None = Field(None, max_length=100)

#chatgpt recommended adding this
class ResendInviteRequest(BaseModel):
    invite_token: str

#this one as well
class ResendInviteResponse(BaseModel):
    message: str


class RegistrationCompleteResponse(BaseModel):
    message: str
    status: str