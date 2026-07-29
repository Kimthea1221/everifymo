
from pydantic import BaseModel, constr

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: constr(min_length=8)