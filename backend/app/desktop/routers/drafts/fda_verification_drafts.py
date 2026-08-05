from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.models.fda_verification_drafts import FdaVerificationDraft
from app.models.verification_requests import VerificationRequest
from app.models.complaints import Complaint
from app.models.users import User
from app.desktop.schemas.drafts.drafts import (
    FdaVerificationDraftSave,
    FdaVerificationDraftResponse,
    FdaVerificationDraftDetailResponse,
    FdaVerificationDraftListItem,
    DraftStatus,
    SortOption,
)
from app.core.dependencies import get_current_user


router = APIRouter(prefix="/drafts/fda-verification", tags=["FDA Verification Drafts"])


# Deciding incomplete vs draft is much simpler here than on the LEA
# side — there's only ONE thing that has to be filled in before this
# stops being "incomplete": the officer has to have picked Registered
# or Unregistered. Everything else (CPR number, remarks, reason) can
# stay blank in a draft no matter what.
def _determine_draft_status(data: FdaVerificationDraftSave) -> DraftStatus:
    if data.draft_verification_status is None:
        return DraftStatus.incomplete
    return DraftStatus.draft


# Shared by the POST (create/update) and GET (detail) endpoints — both
# need to load the parent VerificationRequest + Complaint together to
# confirm the request is real AND belongs to this officer's region.
# Returns (verification_request, complaint) as a tuple, or raises 404.
def _get_request_and_complaint_in_region(db: Session, verification_request_id: UUID, current_user):
    result = (
        db.query(VerificationRequest, Complaint)
        .join(Complaint, VerificationRequest.complaint_id == Complaint.complaint_id)
        .filter(
            VerificationRequest.request_id == verification_request_id,
            # Region check happens here, not as a separate query — an
            # officer outside this region should see the exact same
            # 404 as if the request didn't exist at all.
            Complaint.region_id == current_user.region_id,
        )
        .first()
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Verification request not found.")
    return result


    #
    #
    #
    #
    #
    #
    # POST /drafts/fda-verification/{verification_request_id}
    # Saves the officer's in-progress findings for one verification
    # request. First save creates the draft row; every save after
    # that updates the SAME row — the officer never ends up with two
    # drafts for one case, since this checks for an existing draft
    # before deciding whether to insert or update.
@router.post("/{verification_request_id}", response_model=FdaVerificationDraftResponse)
def save_fda_verification_draft(
    verification_request_id: UUID,
    data: FdaVerificationDraftSave,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Confirms the request is real and in-region BEFORE touching the
    # drafts table at all — no point creating a draft against a
    # request this officer shouldn't even be able to see.
    _get_request_and_complaint_in_region(db, verification_request_id, current_user)

    status = _determine_draft_status(data)

    # THE UPSERT CHECK — this single query is what makes "Save Draft"
    # safe to click repeatedly on the same case without ever creating
    # duplicate rows.
    existing_draft = db.query(FdaVerificationDraft).filter(
        FdaVerificationDraft.verification_request_id == verification_request_id,
        FdaVerificationDraft.saved_by == current_user.user_id,
    ).first()

    if existing_draft:
        for field_name, value in data.model_dump().items():
            setattr(existing_draft, field_name, value)
        existing_draft.draft_status = status
        db.commit()
        db.refresh(existing_draft)
        return existing_draft

    new_draft = FdaVerificationDraft(
        saved_by=current_user.user_id,
        verification_request_id=verification_request_id,
        draft_status=status,
        **data.model_dump(),
    )
    db.add(new_draft)
    db.commit()
    db.refresh(new_draft)
    return new_draft


    #
    #
    #
    #
    #
    #
    # GET /drafts/fda-verification/{draft_id}
    # Powers both the "View" and "Edit Draft" buttons in the Saved
    # Drafts table — same call either way, since the officer's own
    # frontend decides whether the form opens read-only or editable.
    # Returns the officer's saved fields PLUS read-only case info
    # (product name, manufacturer, etc.) pulled from the parent
    # request/complaint, so the frontend has everything it needs to
    # redraw the full Verification Queue screen for this case.
@router.get("/{draft_id}", response_model=FdaVerificationDraftDetailResponse)
def get_fda_verification_draft(
    draft_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    draft = db.query(FdaVerificationDraft).filter(
        FdaVerificationDraft.draft_id == draft_id,
        # Ownership check — same vague-404 reasoning as the LEA
        # drafts: "not found" whether it truly doesn't exist, or it
        # exists but belongs to a different officer.
        FdaVerificationDraft.saved_by == current_user.user_id,
    ).first()

    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    verification_request, complaint = (
        db.query(VerificationRequest, Complaint)
        .join(Complaint, VerificationRequest.complaint_id == Complaint.complaint_id)
        .filter(VerificationRequest.request_id == draft.verification_request_id)
        .first()
    )

    requesting_officer = db.query(User).filter(
        User.user_id == verification_request.requested_by
    ).first()

    if not requesting_officer:
        requested_by_name = None
    else:
        # Build the display name in the same format the UI shows:
        # "Position FirstName LastName" — e.g. "PO3 R. Dela Cruz"
        # Any of the three parts can be null in the DB (users can be
        # invited but not fully set up yet), so we only include the
        # parts that are actually there and join with spaces.
        name_parts = [
            requesting_officer.position,
            requesting_officer.first_name,
            requesting_officer.last_name,
        ]
        assembled = " ".join(part for part in name_parts if part is not None)
        # If every single field was null, return None rather than an
        # empty string — None is more honest ("we don't know") than "".
        requested_by_name = assembled if assembled else None

    return FdaVerificationDraftDetailResponse(
        **FdaVerificationDraftResponse.model_validate(draft).model_dump(),
        case_reference=complaint.case_reference,
        product_name=verification_request.product_name,
        manufacturer=complaint.manufacturer,
        product_category=complaint.product_category,
        requested_by_name=requested_by_name,
        requested_at=verification_request.requested_at,
    )


    #
    #
    #
    #
    #
    #
    # DELETE /drafts/fda-verification/{draft_id}
    # Removes one draft. Used by the "⋮" menu's Delete option, AND
    # reused later by the real submit logic — once an officer's
    # findings are actually submitted to verification_requests, the
    # leftover draft for that case gets deleted the same way.
@router.delete("/{draft_id}")
def delete_fda_verification_draft(
    draft_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    draft = db.query(FdaVerificationDraft).filter(
        FdaVerificationDraft.draft_id == draft_id,
        FdaVerificationDraft.saved_by == current_user.user_id,
    ).first()

    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found.")

    db.delete(draft)
    db.commit()
    return {"message": "Draft deleted successfully."}


    #
    #
    #
    #
    #
    #
    # GET /drafts/fda-verification/
    # Fills the whole Saved Drafts table (Image 4 from earlier) — one
    # row per draft this officer owns, with case_reference/
    # product_name/manufacturer/category pulled in from the joined
    # request+complaint, since none of that lives on the draft row
    # itself.
@router.get("/", response_model=list[FdaVerificationDraftListItem])
def list_fda_verification_drafts(
    search: str | None = Query(None),
    sort: SortOption = Query(SortOption.recently_edited),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = (
        db.query(FdaVerificationDraft, VerificationRequest, Complaint)
        .join(VerificationRequest, FdaVerificationDraft.verification_request_id == VerificationRequest.request_id)
        .join(Complaint, VerificationRequest.complaint_id == Complaint.complaint_id)
        .filter(FdaVerificationDraft.saved_by == current_user.user_id)
    )

    if search is not None:
        # Matches on EITHER case reference or product name — mirrors
        # the "Search Case ID, Product, or Manufacturer..." search
        # box shown in the UI.
        query = query.filter(
            Complaint.case_reference.ilike(f"%{search}%")
            | VerificationRequest.product_name.ilike(f"%{search}%")
        )

    if sort == SortOption.recently_edited:
        query = query.order_by(FdaVerificationDraft.updated_at.desc())
    elif sort == SortOption.oldest_first:
        query = query.order_by(FdaVerificationDraft.updated_at.asc())
    elif sort == SortOption.product_name_az:
        query = query.order_by(VerificationRequest.product_name.asc())

    results = query.all()

    # Each row comes back as a tuple (draft, verification_request,
    # complaint) because of the multi-model query above — build the
    # flat list item shape the frontend actually wants from each one.
    return [
        FdaVerificationDraftListItem(
            draft_id=draft.draft_id,
            verification_request_id=draft.verification_request_id,
            case_reference=complaint.case_reference,
            product_name=verification_request.product_name,
            manufacturer=complaint.manufacturer,
            product_category=complaint.product_category,
            draft_status=draft.draft_status,
            updated_at=draft.updated_at,
        )
        for draft, verification_request, complaint in results
    ]