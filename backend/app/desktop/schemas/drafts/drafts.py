from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


# ============================================================
# ENUMS
# These mirror the CHECK constraints in the model files exactly.
# If the database only allows these strings, the schema shouldn't
# allow anything else either — this catches typos before they
# ever reach a SQL query.
# ============================================================

class DraftStatus(str, Enum):
    incomplete = "incomplete"
    draft = "draft"


class IdType(str, Enum):
    philsys = "philsys"
    passport = "passport"
    drivers_license = "drivers_license"
    other = "other"


class Priority(str, Enum):
    standard = "standard"
    high = "high"
    urgent = "urgent"
    critical = "critical"


class DraftType(str, Enum):
    walkin = "walkin"
    verification = "verification"


class SortOption(str, Enum):
    recently_edited = "recently_edited"
    oldest_first = "oldest_first"
    product_name_az = "product_name_az"


# ============================================================
# WALK-IN INTAKE DRAFT
# ============================================================

# What the officer's form sends us when they hit "Save as Draft."
# Every field is optional here on purpose — the officer might save
# a half-filled form. Deciding whether that makes the row
# "incomplete" or "draft" happens later, in the service layer,
# not here.
class WalkinIntakeDraftSave(BaseModel):
    full_name: str | None = None
    contact_number: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=255)
    id_type: IdType | None = None
    address: str | None = None

    product_name: str | None = None
    manufacturer: str | None = Field(None, max_length=255)
    product_category: str | None = Field(None, max_length=100)
    place_of_purchase: str | None = None
    date_of_purchase: date | None = None
    amount_paid: Decimal | None = None
    nature_of_complaint: str | None = None


# What we send BACK — e.g. when the officer reopens a saved draft,
# or when one row of the Saved Drafts table is returned.
# Inherits every field from WalkinIntakeDraftSave above, then adds
# the columns the officer never types in themselves — the ones the
# database/backend generates or controls.
class WalkinIntakeDraftResponse(WalkinIntakeDraftSave):
    draft_id: UUID
    saved_by: UUID
    region_id: UUID
    draft_status: DraftStatus
    created_at: datetime
    updated_at: datetime

    # Lets this schema read fields off a SQLAlchemy model object
    # (dot access) instead of requiring a plain dict.
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# ATTACHMENTS  (walkin_intake_drafts only — verification request
# drafts have no attachments table of their own, per the schema)
# ============================================================

# Read-only response schema — attachments are created via file
# upload (handled by the endpoint, not by the officer submitting
# JSON), so there's no matching "Save" schema for this one.
class DraftAttachmentResponse(BaseModel):
    attachment_id: UUID
    walkin_draft_id: UUID
    file_name: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Unified row for the "All Drafts" table (Image 1). Built manually
# in the endpoint from a join, not from a single ORM object — so
# this does NOT use from_attributes=True like the others.
class UnifiedDraftResponse(BaseModel):
    draft_id: UUID
    draft_type: DraftType
    product_name: str | None
    manufacturer: str | None
    product_category: str | None
    complainant_name: str | None
    saved_by: UUID
    region_id: UUID
    draft_status: DraftStatus
    created_at: datetime
    updated_at: datetime


# ============================================================
# VERIFICATION REQUEST DRAFT
# ============================================================

# What gets sent when the officer hits "Save Draft" on the
# "Compose verification request to FDA" screen (Image 3).
# NOTE: complaint_id is required here, unlike the officer-typed
# fields below — the draft can't exist without knowing which
# complaint it's attached to (see Image 2, the officer clicks
# INTO a specific walk-in case card first).
class VerificationRequestDraftSave(BaseModel):
    complaint_id: UUID

    product_code: str | None = Field(None, max_length=100)
    priority: Priority | None = None
    notes_to_fda: str | None = None


# What we send back — reopening a saved draft, or one row in the
# "Verification Request" list. Inherits complaint_id, product_code,
# priority, and notes_to_fda from VerificationRequestDraftSave, then
# adds the backend/database-controlled columns.
class VerificationRequestDraftResponse(VerificationRequestDraftSave):
    draft_id: UUID
    saved_by: UUID
    region_id: UUID
    draft_status: DraftStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)