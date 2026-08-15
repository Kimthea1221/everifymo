from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.verification_request_drafts import VerificationRequestDraft
from app.models.verification_requests import VerificationRequest
from app.models.complaints import Complaint

from app.core.complaint_status import transition_complaint_status


def _create_verification_request(
    db: Session,
    current_user,
    complaint_id: UUID,
    product_code: str | None,
    priority: str,
    complaint_statement: str,
    region_id: UUID,   # region parameter added to ensure the request is created within the correct region
) -> VerificationRequest:
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id,
        Complaint.region_id == region_id,   # region scoping to ensure the complaint belongs to the user's region
        ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Linked complaint not found.")

    # Sending a verification request always moves the complaint from
    # 'open' to 'under_review' — this is what makes it disappear from
    # the "Ready to Send" queue.
    transition_complaint_status(complaint, "under_review")

    new_request = VerificationRequest(
        complaint_id=complaint_id,
        requested_by=current_user.user_id,
        product_name=complaint.product_title,
        product_code=product_code,
        complaint_statement=complaint_statement,
        verification_request_status="pending",
        priority=priority,
    )
    db.add(new_request)
    db.flush()

    return new_request


def submit_verification_draft(db: Session, draft_id: UUID, current_user) -> VerificationRequest:
    draft = db.query(VerificationRequestDraft).filter(
        VerificationRequestDraft.draft_id == draft_id,
        VerificationRequestDraft.saved_by == current_user.user_id,
    ).first()

    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    # ADDED — same defense-in-depth check
    if draft.draft_status != "draft":
        raise HTTPException(status_code=400, detail="This draft is still incomplete and cannot be submitted yet.")

    new_request = _create_verification_request(
        db, current_user,
        complaint_id=draft.complaint_id,
        product_code=draft.product_code,
        priority=draft.priority,
        complaint_statement=draft.notes_to_fda,
        region_id=draft.region_id,   # region parameter passed to ensure the request is created within the correct region
    )

    # Point of no return — the real verification_requests row exists now
    db.commit()
    db.refresh(new_request)

    # Only now delete the draft — no files to clean up for this
    # draft type, so no disk-cleanup step needed unlike walk-in submit
    db.delete(draft)
    db.commit()

    return new_request


def create_verification_request_direct(
    db: Session,
    current_user,
    complaint_id: UUID,
    product_code: str | None,
    priority: str,
    notes_to_fda: str,
) -> VerificationRequest:
    new_request = _create_verification_request(
        db, current_user,
        complaint_id=complaint_id,
        product_code=product_code,
        priority=priority,
        complaint_statement=notes_to_fda,
        region_id=current_user.region_id,   # region parameter passed to ensure the request is created within the correct region
    )
    db.commit()
    db.refresh(new_request)
    return new_request