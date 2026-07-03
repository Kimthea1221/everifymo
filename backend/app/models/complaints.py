from sqlalchemy import Column, String, ForeignKey, Text, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base

class Complaint(Base):
    __tablename__ = 'complaints_table'

    complaint_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"), 
    )

    case_reference = Column(String(20), unique=True, nullable=False)
    source = Column(String(50), nullable=False)
    platform = Column(String(50), nullable=True)
    product_title = Column(Text, nullable=False)
    product_url = Column(Text, nullable=True)
    seller_name = Column(String(255), nullable=True)

    matched_product_id = Column(
        UUID(as_uuid=True),
        #ForeignKey("registered_products_table.product_id", ondelete="SET NULL"), 
        nullable=True,
        comment="The FK will be add later on"
    )

    verification_result = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, server_default=text("'open'"))
    
    consumer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("consumer_account_table.consumer_id", ondelete="SET NULL"),
        nullable=True 
    )

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    closed_at = Column(DateTime(timezone=True), nullable=True)
