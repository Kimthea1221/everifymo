from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.Product_database.unregistered_advisories import (
    UnregisteredAdvisoryCreate,
    UnregisteredAdvisoryResponse,
)
from app.desktop.services.Product_database.unregistered_advisory_service import create_unregistered_advisory

router = APIRouter(prefix="/unregistered-advisories", tags=["Unregistered Advisories"])


@router.post("/", response_model=UnregisteredAdvisoryResponse)
def add_unregistered_advisory(
    payload: UnregisteredAdvisoryCreate,
    db: Session = Depends(get_db),
):
    return create_unregistered_advisory(db, payload, None)