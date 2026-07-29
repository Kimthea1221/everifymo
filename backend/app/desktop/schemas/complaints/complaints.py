from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ComplaintResponse(BaseModel):
    complaint_id: UUID
    case_reference: str
    region_id: UUID
    source: str
    product_title: str
    manufacturer: str | None
    product_category: str | None
    place_of_purchase: str | None
    date_of_purchase: date | None
    amount_paid: Decimal | None
    nature_of_complaint: str | None
    status: str
    complainant_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)