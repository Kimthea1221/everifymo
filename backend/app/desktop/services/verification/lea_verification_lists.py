from sqlalchemy.orm import Session

from app.models.complaints import Complaint
from app.desktop.schemas.verification.verification import LeaVerificationQueueCounts


# tiny dashboard counts for the LEA verification tabs — mirrors
# get_fda_verification_queue_counts in shape, but counts Complaint.status
# instead of VerificationRequest.verification_request_status, since these
# three tabs track LEA's own post-FDA-response actions.
def get_lea_verification_queue_counts(db: Session, current_user) -> LeaVerificationQueueCounts:
    base = db.query(Complaint).filter(Complaint.region_id == current_user.region_id)

    return LeaVerificationQueueCounts(
        fda_response_count=base.filter(
            Complaint.status == "takedown_requested"
        ).count(),
        initiated_count=base.filter(
            Complaint.status == "takedown_initiated"
        ).count(),
        # Dismissed tab = anything done and closed, whatever the reason
        # (dismissed outright, or completed — e.g. registered/rejected/
        # completed, distinguished by the "Reason Closed" column on the
        # detail view, not by which status bucket it's counted in here)
        dismissed_count=base.filter(
            Complaint.status.in_(["dismissed", "completed"])
        ).count(),
    )