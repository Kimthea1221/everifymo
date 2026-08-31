import uuid

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


engine = create_engine(settings.DATABASE_URL)


@event.listens_for(engine, "connect")
def _register_sqlite_uuid_functions(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        dbapi_connection.create_function("gen_random_uuid", 0, lambda: str(uuid.uuid4()))
        dbapi_connection.create_function("uuid_generate_v4", 0, lambda: str(uuid.uuid4()))


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()