from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.verification_requests import VerificationRequest
from app.models.complaints import Complaint
from app.core.complaint_status import transition_complaint_status
from app.desktop.schemas.verification.verification import (
    LeaInitiateTakedownRequest,
    LeaFdaResponseActionResponse,
)

from app.desktop.services.notifications.notification_service import (
    notify_fda_lea_acknowledged,
    notify_fda_takedown_initiated,  # ADDED
)


# Shared lookup for both actions below — region-scoped, 404s the same
# way whether the request truly doesn't exist or belongs to another region.
def _get_fda_response_in_region(db: Session, request_id: UUID, current_user):
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


# "Dismiss Case" (registered) and "Acknowledge" (rejected) — complaint
# status is already dismissed from FDA's submit; this just marks that
# LEA has reviewed it, so it drops out of FDA Response into Closed.
def acknowledge_fda_response(
    db: Session, request_id: UUID, current_user
) -> LeaFdaResponseActionResponse:
    verification_request, complaint = _get_fda_response_in_region(db, request_id, current_user)

    if verification_request.verification_request_status not in ("confirmed_registered", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="Only registered or rejected FDA responses can be acknowledged here.",
        )

    if verification_request.lea_acknowledged_at is not None:
        raise HTTPException(status_code=400, detail="This response has already been acknowledged.")

    verification_request.lea_acknowledged_at = datetime.now(timezone.utc)
    verification_request.lea_acknowledged_by = current_user.user_id

    notify_fda_lea_acknowledged(db, complaint)  # ADDED for notification to FDA personnel that LEA has acknowledged the FDA response

    db.commit()
    db.refresh(verification_request)
    db.refresh(complaint)

    return LeaFdaResponseActionResponse(
        request_id=verification_request.request_id,
        complaint_id=complaint.complaint_id,
        complaint_status=complaint.status,
        lea_acknowledged_at=verification_request.lea_acknowledged_at,
    )


# "Initiate Takedown" (unregistered) — the one real status transition
# on this tab: takedown_requested -> takedown_initiated.
def initiate_takedown(
    db: Session, request_id: UUID, current_user, data: LeaInitiateTakedownRequest
) -> LeaFdaResponseActionResponse:
    verification_request, complaint = _get_fda_response_in_region(db, request_id, current_user)

    if verification_request.verification_request_status != "confirmed_unregistered":
        raise HTTPException(
            status_code=400,
            detail="Only unregistered FDA responses can be moved to takedown.",
        )

    # Notes stay optional, but the timestamp/officer always stamp —
    # the Initiated Cases list needs a reliable "activity" date even
    # when no notes were typed at this step.
    if data.field_operation_notes is not None:
        complaint.field_operation_notes = data.field_operation_notes
    complaint.field_operation_logged_at = datetime.now(timezone.utc)
    complaint.field_operation_logged_by = current_user.user_id

    # Reads complaint.source internally — always 'walk_in' here.
    transition_complaint_status(complaint, "takedown_initiated")

    notify_fda_takedown_initiated(db, complaint) #Added for notification to FDA personnel that a takedown operation has been initiated
    
    db.commit()
    db.refresh(verification_request)
    db.refresh(complaint)

    return LeaFdaResponseActionResponse(
        request_id=verification_request.request_id,
        complaint_id=complaint.complaint_id,
        complaint_status=complaint.status,
        lea_acknowledged_at=verification_request.lea_acknowledged_at,
    )