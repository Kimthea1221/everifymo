from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ToPrintStatus(BaseModel):
    history_id: Optional[UUID] = None
    complaint_id: UUID
    new_status: str
    change_note: Optional[str] = None
    product_title: str
