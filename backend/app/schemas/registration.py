from pydantic import BaseModel
from uuid import UUID


class ValidateTokenResponse(BaseModel):   
    email: str                         
    role: str
    region_id: UUID | None
    region_name: str | None        


class RegistrationCompleteRequest(BaseModel):
    invite_token: str
    first_name: str                
    last_name: str
    position: str
    middle_name: str | None = None    
    employee_id: str | None = None
    contact_number: str | None = None
    department: str | None = None


class RegistrationCompleteResponse(BaseModel):
    message: str
    status: str