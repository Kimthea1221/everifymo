from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    request_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    complaint_id = Column(
        UUID(as_uuid=True),
        ForeignKey("complaints.complaint_id", ondelete="RESTRICT"),
        nullable=False,
    )
    requested_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
    )

    product_name = Column(Text, nullable=False)
    product_code = Column(String(100), nullable=True)
    complaint_statement = Column(Text, nullable=False)

    verification_request_status = Column(
        String(50), nullable=False, server_default=text("'queued'")
    )
    priority = Column(String(20), nullable=False, server_default=text("'standard'"))

    field_operation_notes = Column(Text, nullable=True)
    field_operation_logged_at = Column(DateTime(timezone=True), nullable=True)
    field_operation_logged_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )

    reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
    reminder_sent_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )

    rejection_reason = Column(Text, nullable=True)
    recalled_at = Column(DateTime(timezone=True), nullable=True)
    recalled_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )

    responded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    response_notes = Column(Text, nullable=True)

    requested_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    responded_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "verification_request_status IN "
            "('queued', 'pending', 'confirmed_registered', "
            "'confirmed_unregistered', 'rejected', 'recalled')",
            name="ck_verification_requests_status",
        ),
        CheckConstraint(
            "priority IN ('standard', 'high', 'urgent', 'critical')",
            name="ck_verification_requests_priority",
        ),
        CheckConstraint(
            "(verification_request_status != 'rejected') OR (rejection_reason IS NOT NULL)",
            name="ck_verification_requests_rejection_reason_required",
        ),
        CheckConstraint(
            "(recalled_at IS NULL AND recalled_by IS NULL) OR "
            "(recalled_at IS NOT NULL AND recalled_by IS NOT NULL)",
            name="ck_verification_requests_recalled_pair",
        ),
    )