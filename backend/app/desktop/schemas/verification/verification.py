from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.desktop.schemas.drafts.drafts import Priority


# Used ONLY by the direct path (no draft) — officer composes and
# clicks "Send Request to FDA" immediately. The draft-submit path
# never needs this schema, since every field it needs already lives
# on the existing VerificationRequestDraft row.
class VerificationRequestCreate(BaseModel):
    complaint_id: UUID
    product_code: str | None = None
    priority: Priority
    notes_to_fda: str


class VerificationRequestResponse(BaseModel):
    request_id: UUID
    complaint_id: UUID
    requested_by: UUID
    product_name: str
    product_code: str | None
    complaint_statement: str
    verification_request_status: str
    priority: str
    requested_at: datetime
    responded_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class VerificationRequestAwaitingFDAResponse(BaseModel):
    request_id: UUID
    complaint_id: UUID
    case_reference: str
    product_name: str
    manufacturer: str | None
    product_category: str | None
    complainant_name: str | None
    source: str
    priority: str
    requested_at: datetime