from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.Product_database.registered_products import (
    RegisteredProductCreate,
    RegisteredProductResponse,
)
from app.desktop.services.Product_database.registered_product_service import create_registered_product

router = APIRouter(prefix="/registered-products", tags=["Registered Products"])


@router.post("/", response_model=RegisteredProductResponse)
def add_registered_product(
    payload: RegisteredProductCreate,
    db: Session = Depends(get_db),
):
    from app.models.users import User
    # Bypass auth: gamitin ang unang user mula sa database (o None) para sa added_by field
    user = db.query(User).first()
    user_id = user.user_id if user else None
    return create_registered_product(db, payload, user_id)