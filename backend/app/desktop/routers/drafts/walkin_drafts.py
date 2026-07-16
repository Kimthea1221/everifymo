import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.models.walkin_intake_drafts import WalkinIntakeDraft
from app.models.draft_attachments import DraftAttachment
from app.desktop.schemas.drafts.drafts import (
    WalkinIntakeDraftSave,
    WalkinIntakeDraftResponse,
    DraftStatus,
)
from app.core.dependencies import get_current_user


router = APIRouter(prefix="/drafts/walkin", tags=["Walk-in Intake Drafts"])

# Local disk folder for now — swap this one line later when S3 is ready.
# Every other line in this file stays the same when that swap happens.
UPLOAD_DIR = "uploads/draft_attachments"


# Fields the officer's form requires (see Image 4/5) — everything
# EXCEPT full_name, contact_number, id_type, email, address,
# amount_paid, which are allowed to stay blank. At least one
# attached file is also required, but that's checked separately
# below since files aren't part of WalkinIntakeDraftSave's fields.
REQUIRED_TEXT_FIELDS = [
    "product_name", "manufacturer", "product_category",
    "place_of_purchase", "date_of_purchase", "nature_of_complaint",
]


def _determine_draft_status(data: WalkinIntakeDraftSave, has_files: bool) -> DraftStatus:
    # Check every required field one at a time. getattr(data, "product_name")
    # is the same as writing data.product_name — using the string name lets
    # us loop through all 6 fields instead of writing 6 separate if-checks.
    for field_name in REQUIRED_TEXT_FIELDS:
        if getattr(data, field_name) is None:   
            return DraftStatus.incomplete
    # All required text fields are filled in, but no file has been
    # attached yet — still not a complete draft.               
    if not has_files:
        # exists yet — still incomplete
        return DraftStatus.incomplete
    # Every required field is present AND at least one file exists.
    return DraftStatus.draft                        


def _save_file_to_disk(file: UploadFile, draft_id) -> dict:
    # Create the top-level uploads folder if it doesn't exist yet.
    # exist_ok=True means "don't error if it's already there."
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Prefix the filename with a random UUID so two officers uploading
    # a file with the same name (e.g. "receipt.jpg") on the same day
    # don't silently overwrite each other's file on disk.
    unique_name = f"{uuid4()}_{file.filename}"
    # Store each draft's files inside their own subfolder, keyed by
    # draft_id — keeps everything organized and easy to find manually.
    destination_path = os.path.join(UPLOAD_DIR, str(draft_id), unique_name)
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)

    # "wb" = write, in binary mode (files are bytes, not text).
    # copyfileobj streams the upload to disk in small chunks instead
    # of loading the entire file into memory at once — matters for
    # large PDFs/photos.
    with open(destination_path, "wb") as buffer:
        # file.file is the raw stream FastAPI gives us; shutil.copyfileobj
        # streams it to disk without loading the whole thing into memory
        shutil.copyfileobj(file.file, buffer)

    # Return exactly the fields DraftAttachment needs, so the caller
    # can build the row without repeating this logic.
    return {
        "file_name": file.filename,
        "file_path": destination_path,
        "file_size_bytes": os.path.getsize(destination_path),
        "mime_type": file.content_type,
    }


@router.post("/", response_model=WalkinIntakeDraftResponse)
def save_walkin_draft(
    # Multipart requests can't take one Pydantic object as the body
    # the way JSON requests can — each field has to be declared
    # separately so FastAPI knows to parse it out of form data.
    full_name: str | None = Form(None),
    contact_number: str | None = Form(None),
    email: str | None = Form(None),
    id_type: str | None = Form(None),
    address: str | None = Form(None),
    product_name: str | None = Form(None),
    manufacturer: str | None = Form(None),
    product_category: str | None = Form(None),
    place_of_purchase: str | None = Form(None),
    date_of_purchase: str | None = Form(None),
    amount_paid: float | None = Form(None),
    nature_of_complaint: str | None = Form(None),

    # File() marks this as an uploaded file rather than a text field.
    # A list, since the officer can drop multiple files at once
    # (Image 5). default=[] means saving with zero files is allowed.
    files: list[UploadFile] = File(default=[]),   # 5. what class marks this parameter as a file upload?

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Repackage the loose Form() parameters back into a
    # WalkinIntakeDraftSave object, so _determine_draft_status can
    # reuse the exact same logic regardless of whether the request
    # arrived as JSON or multipart form data.
    data = WalkinIntakeDraftSave(
        full_name=full_name, contact_number=contact_number, email=email,
        id_type=id_type, address=address, product_name=product_name,
        manufacturer=manufacturer, product_category=product_category,
        place_of_purchase=place_of_purchase, date_of_purchase=date_of_purchase,
        amount_paid=amount_paid, nature_of_complaint=nature_of_complaint,
    )

    status = _determine_draft_status(data, has_files=len(files) > 0)

    # Build the draft row. saved_by and region_id come from the
    # logged-in officer's token, NEVER from the request body — an
    # officer should never be able to claim someone else's identity
    # or region just by editing form data.
    new_draft = WalkinIntakeDraft(
        saved_by=current_user.user_id,
        region_id=current_user.region_id,
        draft_status=status,
        **data.model_dump(),
    )
    db.add(new_draft)
    db.commit()
    db.refresh(new_draft)
    # Only past this line does new_draft.draft_id exist as a REAL row
    # in Postgres — which is required before any DraftAttachment can
    # legally reference it via the walkin_draft_id foreign key.

    for uploaded_file in files:
        file_info = _save_file_to_disk(uploaded_file, new_draft.draft_id)
        attachment = DraftAttachment(
            walkin_draft_id=new_draft.draft_id,   # 6. which attribute on new_draft links this attachment to it?
            **file_info,
        )
        db.add(attachment)   # 7. same method used to stage new_draft earlier
    
    # One commit for all attachment rows together, rather than
    # committing inside the loop on every single file.
    db.commit()
    db.refresh(new_draft)

    return new_draft