from uuid import UUID
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.verification_request_drafts import VerificationRequestDraft
from backend.app.models.verification_requests import VerificationRequest
from backend.app.models.complaints import Complaint

from backend.app.core.complaint_status import transition_complaint_status


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


#ashanti start

def recall_verification_request(db: Session, request_id: UUID, current_user) -> VerificationRequest:
    request = db.query(VerificationRequest).join(
        Complaint, VerificationRequest.complaint_id == Complaint.complaint_id
    ).filter(
        VerificationRequest.request_id == request_id,
        Complaint.region_id == current_user.region_id,   # region scoping, same pattern as everywhere else
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Verification request not found.")

    if request.verification_request_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be recalled.",
        )

    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == request.complaint_id
    ).first()

    # Send the complaint back to Ready to Send — raises a clear 400
    # itself if this transition somehow isn't allowed, so no need to
    # duplicate that check here.
    transition_complaint_status(complaint, "open")

    request.verification_request_status = "recalled"
    request.recalled_at = datetime.now(timezone.utc)
    request.recalled_by = current_user.user_id

    # TODO: notify FDA that LEA recalled this request. Not built yet —
    # no notification system exists in the project as of this task.
    # Whoever builds notifications should hook in here: fire an event
    # or call a notify_fda(...) service right after this comment,
    # using request.request_id / complaint.case_reference as context.

    db.commit()
    db.refresh(request)

    return request


REMINDER_COOLDOWN = timedelta(hours=24)


def resend_reminder(db: Session, request_id: UUID, current_user) -> VerificationRequest:
    request = db.query(VerificationRequest).join(
        Complaint, VerificationRequest.complaint_id == Complaint.complaint_id
    ).filter(
        VerificationRequest.request_id == request_id,
        Complaint.region_id == current_user.region_id,
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Verification request not found.")

    if request.verification_request_status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be reminded.",
        )

    now = datetime.now(timezone.utc)

    if request.reminder_sent_at is not None:
        elapsed = now - request.reminder_sent_at
        if elapsed < REMINDER_COOLDOWN:
            wait_left = REMINDER_COOLDOWN - elapsed
            # Round down to whole minutes — an officer doesn't need
            # second/microsecond precision, just a rough sense of when
            # they can try again.
            total_minutes = int(wait_left.total_seconds() // 60)
            hours, minutes = divmod(total_minutes, 60)

            if hours > 0:
                readable_wait = f"{hours} hour{'s' if hours != 1 else ''} and {minutes} minute{'s' if minutes != 1 else ''}"
            else:
                readable_wait = f"{minutes} minute{'s' if minutes != 1 else ''}"

            raise HTTPException(
                status_code=400,
                detail=f"A reminder was already sent recently. Try again in {readable_wait}.",
            )

    request.reminder_sent_at = now
    request.reminder_sent_by = current_user.user_id

    # TODO: notify FDA that LEA sent a reminder on this request.

    db.commit()
    db.refresh(request)

    return request

#ashanti  end