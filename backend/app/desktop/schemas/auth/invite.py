from pydantic import BaseModel, EmailStr
from typing import Literal
import uuid

class InvitePersonnelRequest(BaseModel):
    email: EmailStr
    region_id: uuid.UUID
    role: Literal["FDA", "LEA-CIDG"]

