from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from app.desktop.schemas.drafts.drafts import DraftStatus, Priority

from pydantic import BaseModel, ConfigDict


class ComplaintResponse(BaseModel):
    complaint_id: UUID
    case_reference: str
    region_id: UUID
    source: str
    product_title: str
    manufacturer: str | None
    product_category: str | None
    place_of_purchase: str | None
    date_of_purchase: date | None
    amount_paid: Decimal | None
    nature_of_complaint: str | None
    status: str
    complainant_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintAwaitingRequestResponse(BaseModel):
    complaint_id: UUID
    case_reference: str
    product_title: str
    manufacturer: str | None
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# VERIFICATION REQUEST
# ============================================================

class SharedFileResponse(BaseModel):
    file_id: UUID
    file_name: str
    file_size_bytes: int
    mime_type: str
    model_config = ConfigDict(from_attributes=True)


# The joined, read-only display data for the "Compose verification
# request" screen — case info, product info, complainant, and the
# auto-attached files list. Used alone when an officer clicks a
# complaint directly (no draft yet), and nested inside
# VerificationRequestDraftDetailResponse when reopening an existing
# draft. Built manually from a join, so no from_attributes here.
class ComplaintVerificationDetailResponse(BaseModel):
    complaint_id: UUID
    case_reference: str
    product_title: str
    manufacturer: str | None
    product_category: str | None
    complainant_name: str | None
    created_at: datetime
    source: str
    attached_files: list[SharedFileResponse]


# Reopening an existing verification draft. Nests the read-only
# complaint detail above under `complaint`, alongside the draft's
# own editable fields — keeps "read-only" and "editable" visually
# separate, and avoids field-name collisions (both a complaint and
# a draft have their own created_at).
class VerificationRequestDraftDetailResponse(BaseModel):
    draft_id: UUID
    draft_status: DraftStatus
    product_code: str | None
    priority: Priority | None
    notes_to_fda: str | None
    saved_by: UUID
    region_id: UUID
    created_at: datetime
    updated_at: datetime
    complaint: ComplaintVerificationDetailResponse