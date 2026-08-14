from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.registered_products import RegisteredProduct
from app.desktop.schemas.Product_database.registered_products import RegisteredProductCreate


def create_registered_product(db: Session, data: RegisteredProductCreate, current_user_id):
    existing = db.query(RegisteredProduct).filter(
        RegisteredProduct.registration_number == data.registration_number,
        RegisteredProduct.deleted_at.is_(None)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration Number must be unique. This number already exists."
        )

    new_product = RegisteredProduct(
        product_name=data.product_name,
        brand_name=data.brand_name,
        registration_number=data.registration_number,
        product_category=data.product_category,
        date_registered=data.date_registered,
        expiry_date=data.expiry_date,
        added_by=current_user_id,
        # NOTE: registration_status hindi na kailangan ipasa dito,
        # may server_default na 'registered' sa DB
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product