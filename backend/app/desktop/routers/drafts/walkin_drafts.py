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
from app.desktop.dependencies.fake_auth import get_current_user


router = APIRouter(prefix="/drafts/walkin", tags=["Walk-in Intake Drafts"])

# Local disk folder for now — swap this one line later when S3 is ready
UPLOAD_DIR = "uploads/draft_attachments"


# Required per your last message: everything except full_name,
# contact_number, id_type, email, address, amount_paid — PLUS at
# least one attached file.
REQUIRED_TEXT_FIELDS = [
    "product_name", "manufacturer", "product_category",
    "place_of_purchase", "date_of_purchase", "nature_of_complaint",
]


def _determine_draft_status(data: WalkinIntakeDraftSave, has_files: bool) -> DraftStatus:
    for field_name in REQUIRED_TEXT_FIELDS:
        if getattr(data, field_name) is ___:    # 1. same blank as before — "left blank" value
            return DraftStatus.___                # 2. incomplete
    if not has_files:
        # required text fields are all filled in, but no attachment
        # exists yet — still incomplete
        return DraftStatus.___                    # 3. incomplete (same answer as blank 2, different reason)
    return DraftStatus.___                         # 4. everything's here — draft


def _save_file_to_disk(file: UploadFile, draft_id) -> dict:
    # Make sure the folder exists before writing into it
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Prefix with a random UUID so two different officers uploading
    # "receipt.jpg" on the same day don't overwrite each other
    unique_name = f"{uuid4()}_{file.filename}"
    destination_path = os.path.join(UPLOAD_DIR, str(draft_id), unique_name)
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)

    with open(destination_path, "wb") as buffer:
        # file.file is the raw stream FastAPI gives us; shutil.copyfileobj
        # streams it to disk without loading the whole thing into memory
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_name": file.filename,
        "file_path": destination_path,
        "file_size_bytes": os.path.getsize(destination_path),
        "mime_type": file.content_type,
    }


@router.post("/", response_model=WalkinIntakeDraftResponse)
def save_walkin_draft(
    # Each text field becomes its own Form() parameter — this is the
    # multipart equivalent of what WalkinIntakeDraftSave did for JSON
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

    # A list, since multiple files can be dropped at once (Image 5).
    # default=[] means the officer can save with zero files too.
    files: list[UploadFile] = ___(default=[]),   # 5. what class marks this parameter as a file upload?

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Re-build a WalkinIntakeDraftSave object from the raw Form()
    # values, so _determine_draft_status can reuse the exact same
    # function/logic we already tested via JSON earlier
    data = WalkinIntakeDraftSave(
        full_name=full_name, contact_number=contact_number, email=email,
        id_type=id_type, address=address, product_name=product_name,
        manufacturer=manufacturer, product_category=product_category,
        place_of_purchase=place_of_purchase, date_of_purchase=date_of_purchase,
        amount_paid=amount_paid, nature_of_complaint=nature_of_complaint,
    )

    status = _determine_draft_status(data, has_files=len(files) > 0)

    new_draft = WalkinIntakeDraft(
        saved_by=current_user.user_id,
        region_id=current_user.region_id,
        draft_status=status,
        **data.model_dump(),
    )
    db.add(new_draft)
    db.commit()
    db.refresh(new_draft)
    # new_draft.draft_id now exists — safe to attach files to it

    for uploaded_file in files:
        file_info = _save_file_to_disk(uploaded_file, new_draft.draft_id)
        attachment = DraftAttachment(
            walkin_draft_id=new_draft.___,   # 6. which attribute on new_draft links this attachment to it?
            **file_info,
        )
        db.___(attachment)   # 7. same method used to stage new_draft earlier

    db.commit()
    db.refresh(new_draft)

    return new_draft