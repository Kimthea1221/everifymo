from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base

class ConsumerAccount(Base):
    __tablename__ = 'consumer_account_table'

    consumer_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"), 
    )

    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    is_verified = Column(Boolean, nullable=False, server_default=text("false"))

    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    is_locked = Column(Boolean, nullable=False, default=False, server_default=text("false"))
    failed_login_attempts = Column(Integer, nullable=False, default=0, server_default=text("0"))
    last_login = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

