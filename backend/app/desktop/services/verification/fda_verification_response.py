from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.verification_requests import VerificationRequest
from app.models.complaints import Complaint
from app.models.fda_verification_drafts import FdaVerificationDraft
from app.core.complaint_status import transition_complaint_status
from app.desktop.schemas.verification.verification import (
    FdaVerificationSubmitRequest,
    FdaVerificationStatusChoice,
    FdaVerificationRejectRequest,
)

from app.models.users import User
from app.models.shared_files import SharedFile
from app.core.user_display import format_officer_display_name
from app.desktop.schemas.verification.verification import FdaVerificationRequestDetailResponse
from app.desktop.schemas.complaints.complaints import SharedFileResponse


# Shared by both submit and reject below — loads a VerificationRequest
# together with its parent Complaint, but ONLY if that complaint
# belongs to the current officer's region. Returns 404 either way if
# the request truly doesn't exist OR if it exists in a different
# region — an officer outside the region should never be able to
# tell the difference.
def _get_request_and_complaint_in_region(db: Session, request_id: UUID, current_user):
    result = (
        db.query(VerificationRequest, Complaint)
        .join(Complaint, VerificationRequest.complaint_id == Complaint.complaint_id)
        .filter(
            VerificationRequest.request_id == request_id,
            Complaint.region_id == current_user.region_id,
        )
        .first()
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Verification request not found.")
    return result


# The "Submit Verification" button — FDA officer has decided the
# product is either Registered or Unregistered. Validates the fields
# required for whichever one was chosen, writes the final decision
# onto verification_requests, moves the linked complaint to its
# matching next status, and deletes any leftover draft for this
# request since it's no longer relevant once a real decision exists.
def submit_fda_verification_response(
    db: Session,
    request_id: UUID,
    current_user,
    data: FdaVerificationSubmitRequest,
) -> tuple[VerificationRequest, Complaint]:
    verification_request, complaint = _get_request_and_complaint_in_region(db, request_id, current_user)

    # Defense in depth — the frontend shouldn't let an officer resubmit
    # an already-decided request, but the backend must never rely on
    # that alone.
    if verification_request.verification_request_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="This verification request has already been responded to.",
        )

    if data.verification_status == FdaVerificationStatusChoice.registered:
        if not data.cpr_number or not data.cpr_number.strip() or not data.response_notes or not data.response_notes.strip():
            raise HTTPException(
                status_code=400,
                detail="CPR Registration Number and Official FDA Verification Remarks are required for a Registered determination.",
            )
        new_verification_status = "confirmed_registered"
        new_complaint_status = "dismissed"
    else:
        if not data.unregistered_reason or not data.unregistered_reason.strip():
            raise HTTPException(
                status_code=400,
                detail="Reason Product is Not Registered is required for an Unregistered determination.",
            )
        new_verification_status = "confirmed_unregistered"
        new_complaint_status = "takedown_requested"

    verification_request.verification_request_status = new_verification_status
    verification_request.cpr_number = data.cpr_number
    verification_request.cpr_expiry = data.cpr_expiry
    verification_request.response_notes = data.response_notes
    verification_request.unregistered_reason = data.unregistered_reason
    verification_request.responded_by = current_user.user_id
    verification_request.responded_at = datetime.now(timezone.utc)

    # transition_complaint_status reads complaint.source internally
    # to pick the right transition table (walk_in vs extension) — we
    # don't pass it explicitly.
    transition_complaint_status(complaint, new_complaint_status)

    # Clean up any draft(s) left behind for this request — it's now
    # decided, so a draft has no meaning anymore. Deletes across ALL
    # officers who may have drafted against this request, not just
    # the one submitting, since none of those drafts are relevant
    # once the real decision is made.
    db.query(FdaVerificationDraft).filter(
        FdaVerificationDraft.verification_request_id == request_id
    ).delete()

    # One commit at the end — if anything above raised, nothing here
    # has been written yet, so verification_requests and complaints
    # never end up out of sync with each other.
    db.commit()
    db.refresh(verification_request)
    db.refresh(complaint)

    return verification_request, complaint


# The "Reject Request" button — FDA officer is rejecting the
# verification request itself (bad evidence, missing info, invalid
# submission), NOT making a registered/unregistered determination.
# Simpler than submit above: no branching, just requires a reason and
# always ends the same way — request marked rejected, complaint
# dismissed, any leftover draft cleaned up.
def reject_fda_verification_response(
    db: Session,
    request_id: UUID,
    current_user,
    data: FdaVerificationRejectRequest,
) -> tuple[VerificationRequest, Complaint]:
    verification_request, complaint = _get_request_and_complaint_in_region(db, request_id, current_user)

    if verification_request.verification_request_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="This verification request has already been responded to.",
        )

    verification_request.verification_request_status = "rejected"
    verification_request.rejection_reason = data.rejection_reason
    verification_request.responded_by = current_user.user_id
    verification_request.responded_at = datetime.now(timezone.utc)

    # Rejection always dismisses the complaint — FDA is saying the
    # request itself couldn't be acted on (missing info, invalid
    # evidence, etc.), same end state as confirmed_registered.
    transition_complaint_status(complaint, "dismissed")

    db.query(FdaVerificationDraft).filter(
        FdaVerificationDraft.verification_request_id == request_id
    ).delete()

    db.commit()
    db.refresh(verification_request)
    db.refresh(complaint)

    return verification_request, complaint


# Powers the right-panel detail view when an officer clicks a card in
# the Verification Queue — everything the list response doesn't
# already have: requesting officer, product code, the LEA statement,
# and auto-attached evidence documents.
def get_fda_verification_request_detail(
    db: Session,
    request_id: UUID,
    current_user,
) -> FdaVerificationRequestDetailResponse:
    verification_request, complaint = _get_request_and_complaint_in_region(db, request_id, current_user)

    requesting_officer = db.query(User).filter(
        User.user_id == verification_request.requested_by
    ).first()
    requested_by_name = format_officer_display_name(requesting_officer)

    files = db.query(SharedFile).filter(
        SharedFile.complaint_id == complaint.complaint_id
    ).all()

    return FdaVerificationRequestDetailResponse(
        request_id=verification_request.request_id,
        case_reference=complaint.case_reference,
        product_name=verification_request.product_name,
        manufacturer=complaint.manufacturer,
        product_category=complaint.product_category,
        requested_by_name=requested_by_name,
        requested_at=verification_request.requested_at,
        product_code=verification_request.product_code,
        priority=verification_request.priority,
        complaint_statement=verification_request.complaint_statement,
        attached_files=[SharedFileResponse.model_validate(f) for f in files],
    )