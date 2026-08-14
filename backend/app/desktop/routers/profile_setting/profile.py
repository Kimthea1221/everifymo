from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.sessions import get_db
from app.models.users import User
from app.models.regions import Region
from app.desktop.schemas.profile_setting.profile import (
    ProfileResponse,
    ProfileUpdateRequest,
    ChangePasswordRequest,
)
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/profile", tags=["profile"])

AGENCY_LABELS = {
    "fda_personnel": "FDA",
    "lea_personnel": "LEA-CIDG",
    "superadmin": "SUPERADMIN",
}


def build_profile_response(db: Session, user: User) -> ProfileResponse:
    region_name = None
    if user.region_id:
        region = db.query(Region).filter(Region.region_id == user.region_id).first()
        region_name = region.region_name if region else None

    return ProfileResponse(
        user_id=user.user_id,
        first_name=user.first_name,
        middle_name=user.middle_name,
        last_name=user.last_name,
        employee_id=user.employee_id,
        email=user.email,
        contact_number=user.contact_number,
        department=user.department,
        position=user.position,
        role=user.role,
        agency=AGENCY_LABELS.get(user.role, user.role),
        region=region_name,
    )


@router.get("", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_profile_response(db, current_user)


@router.put("/update", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return build_profile_response(db, current_user)


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.password_hash or not verify_password(
        payload.current_password, current_user.password_hash
    ):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    current_user.password_hash = hash_password(payload.new_password)
    current_user.force_password_change = False
    db.commit()

    return {"message": "Password updated successfully"}