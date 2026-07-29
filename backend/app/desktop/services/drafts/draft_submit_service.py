import os
import shutil
from uuid import uuid4, UUID

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.walkin_intake_drafts import WalkinIntakeDraft
from app.models.draft_attachments import DraftAttachment
from app.models.walkin_complainants import WalkinComplainant
from app.models.complaints import Complaint
from app.models.shared_files import SharedFile
from app.core.case_reference import generate_case_reference


SHARED_FILES_DIR = "uploads/shared_files"


def _create_complainant_and_complaint(
    db: Session,
    current_user,
    region_id,
    complainant_fields: dict,
    complaint_fields: dict,
) -> Complaint:
    """
    Shared logic for both submit paths — builds and flushes a
    WalkinComplainant, then a Complaint linked to it. Both the
    draft-submit path and the direct-submit path funnel through
    this, so this insert logic only exists in ONE place.
    """
    case_reference = generate_case_reference(db, region_id=region_id)

    new_complainant = WalkinComplainant(
        **complainant_fields,
        created_by=current_user.user_id,
    )
    db.add(new_complainant)
    db.flush()

    new_complaint = Complaint(
        **complaint_fields,
        case_reference=case_reference,
        region_id=region_id,
        source="walk_in",
        status="open",
        complainant_id=new_complainant.complainant_id,
        created_by=current_user.user_id, 
    )
    db.add(new_complaint)
    db.flush()

    return new_complaint


def _copy_attachment_to_shared_files(source_path: str, complaint_id) -> dict:
    os.makedirs(SHARED_FILES_DIR, exist_ok=True)
    original_filename = os.path.basename(source_path)
    unique_name = f"{uuid4()}_{original_filename}"
    destination_path = os.path.join(SHARED_FILES_DIR, str(complaint_id), unique_name)
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    shutil.copy2(source_path, destination_path)
    return {
        "file_path": destination_path,
        "file_size_bytes": os.path.getsize(destination_path),
    }


def _save_new_upload_to_shared_files(file: UploadFile, complaint_id) -> dict:
    """
    Used ONLY by the direct-submit path — the officer's files here
    were never saved anywhere before (unlike a draft's, which were
    already sitting in draft_attachments). So this saves them
    straight to their permanent location in one step, no copying.
    """
    os.makedirs(SHARED_FILES_DIR, exist_ok=True)
    unique_name = f"{uuid4()}_{file.filename}"
    destination_path = os.path.join(SHARED_FILES_DIR, str(complaint_id), unique_name)
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {
        "file_name": file.filename,
        "file_path": destination_path,
        "file_size_bytes": os.path.getsize(destination_path),
        "mime_type": file.content_type,
    }


def submit_walkin_draft(db: Session, draft_id: UUID, current_user) -> Complaint:
    draft = db.query(WalkinIntakeDraft).filter(
        WalkinIntakeDraft.draft_id == draft_id,
        WalkinIntakeDraft.saved_by == current_user.user_id,
    ).first()

    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    attachments = db.query(DraftAttachment).filter(
        DraftAttachment.walkin_draft_id == draft_id
    ).all()
    original_file_paths = [a.file_path for a in attachments]

    new_complaint = _create_complainant_and_complaint(
        db, current_user, draft.region_id,
        complainant_fields={
            "full_name": draft.full_name,
            "contact_number": draft.contact_number,
            "email": draft.email,
            "id_type": draft.id_type,
            "address": draft.address,
        },
        complaint_fields={
            "product_title": draft.product_name,
            "manufacturer": draft.manufacturer,
            "product_category": draft.product_category,
            "place_of_purchase": draft.place_of_purchase,
            "date_of_purchase": draft.date_of_purchase,
            "amount_paid": draft.amount_paid,
            "nature_of_complaint": draft.nature_of_complaint,
        },
    )

    for attachment in attachments:
        file_info = _copy_attachment_to_shared_files(attachment.file_path, new_complaint.complaint_id)
        db.add(SharedFile(
            complaint_id=new_complaint.complaint_id,
            region_id=draft.region_id,
            uploaded_by=current_user.user_id,
            file_name=attachment.file_name,
            file_path=file_info["file_path"],
            file_size_bytes=file_info["file_size_bytes"],
            mime_type=attachment.mime_type,
        ))

    db.commit()
    db.refresh(new_complaint)

    db.delete(draft)
    db.commit()

    for path in original_file_paths:
        if os.path.exists(path):
            os.remove(path)

    return new_complaint


def create_walkin_complaint_direct(
    db: Session,
    current_user,
    complainant_fields: dict,
    complaint_fields: dict,
    files: list[UploadFile],
) -> Complaint:
    """
    The NO-DRAFT path — officer filled the New Walk-in Intake form
    and clicked "Log Complaint & Queue for FDA" directly, without
    ever saving a draft first (Image 1/2).
    """
    new_complaint = _create_complainant_and_complaint(
        db, current_user, current_user.region_id,
        complainant_fields=complainant_fields,
        complaint_fields=complaint_fields,
    )

    for uploaded_file in files:
        file_info = _save_new_upload_to_shared_files(uploaded_file, new_complaint.complaint_id)
        db.add(SharedFile(
            complaint_id=new_complaint.complaint_id,
            region_id=current_user.region_id,
            uploaded_by=current_user.user_id,
            **file_info,
        ))

    db.commit()
    db.refresh(new_complaint)
    return new_complaint