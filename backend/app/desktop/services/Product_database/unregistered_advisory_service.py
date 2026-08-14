from sqlalchemy.orm import Session

from app.models.unregistered_advisories import UnregisteredAdvisory
from app.desktop.schemas.Product_database.unregistered_advisories import UnregisteredAdvisoryCreate


def create_unregistered_advisory(db: Session, data: UnregisteredAdvisoryCreate, current_user_id):
    new_advisory = UnregisteredAdvisory(
        product_name=data.product_name,
        advisory_details=data.advisory_details,
        advisory_date=data.advisory_date,
        source_url=data.source_url,
        added_by=current_user_id,
    )

    db.add(new_advisory)
    db.commit()
    db.refresh(new_advisory)

    return new_advisory