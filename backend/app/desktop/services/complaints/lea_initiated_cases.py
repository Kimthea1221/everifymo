from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session, aliased

from app.models.complaints import Complaint
from app.models.walkin_complainants import WalkinComplainant
from app.core.complaint_status import transition_complaint_status
from app.desktop.schemas.complaints.complaints import (
    LeaInitiatedCaseListItem,
    LeaInitiatedCaseDetailResponse,
    LeaCloseCaseRequest,
    LeaCloseCaseResponse,
)


# Left panel list — active takedown operations, region-scoped. No
# search/category params, same client-side-filter pattern as the
# other LEA queue tabs.
def list_lea_initiated_cases(db: Session, current_user) -> list[LeaInitiatedCaseListItem]:
    complaints = (
        db.query(Complaint)
        .filter(Complaint.region_id == current_user.region_id, Complaint.status == "takedown_initiated")
        .order_by(Complaint.field_operation_logged_at.desc())
        .all()
    )
    return [LeaInitiatedCaseListItem.model_validate(c) for c in complaints]


# Right panel detail — joins in the complainant name, same as the
# FDA Response detail. No VerificationRequest join needed here; this
# tab only cares about the Complaint's own state.
def get_lea_initiated_case_detail(
    db: Session, complaint_id: UUID, current_user
) -> LeaInitiatedCaseDetailResponse:
    result = (
        db.query(Complaint, WalkinComplainant)
        .outerjoin(WalkinComplainant, Complaint.complainant_id == WalkinComplainant.complainant_id)
        .filter(
            Complaint.complaint_id == complaint_id,
            Complaint.region_id == current_user.region_id,
            Complaint.status == "takedown_initiated",
        )
        .first()
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Initiated case not found.")

    complaint, complainant = result

    return LeaInitiatedCaseDetailResponse(
        complaint_id=complaint.complaint_id,
        case_reference=complaint.case_reference,
        product_title=complaint.product_title,
        manufacturer=complaint.manufacturer,
        complainant_name=complainant.full_name if complainant else None,
        product_category=complaint.product_category,
        logged_at=complaint.created_at,
        source=complaint.source,
        field_operation_notes=complaint.field_operation_notes,
    )


# "Close Case" — the real transition: takedown_initiated -> completed.
# Notes are optional here too; if provided, they overwrite the
# existing field_operation_notes as the final status before closing.
def close_case(
    db: Session, complaint_id: UUID, current_user, data: LeaCloseCaseRequest
) -> LeaCloseCaseResponse:
    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.complaint_id == complaint_id,
            Complaint.region_id == current_user.region_id,
        )
        .first()
    )
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if complaint.status != "takedown_initiated":
        raise HTTPException(status_code=400, detail="Only an active takedown operation can be closed.")

    if data.field_operation_notes is not None:
        complaint.field_operation_notes = data.field_operation_notes

    complaint.field_operation_logged_at = datetime.now(timezone.utc)
    complaint.field_operation_logged_by = current_user.user_id

    transition_complaint_status(complaint, "completed")

    db.commit()
    db.refresh(complaint)

    return LeaCloseCaseResponse(
        complaint_id=complaint.complaint_id,
        complaint_status=complaint.status,
        field_operation_notes=complaint.field_operation_notes,
        field_operation_logged_at=complaint.field_operation_logged_at,
    )