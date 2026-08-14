"""
Throwaway test script - confirms create_notification_for_all_superadmins()
actually inserts a row. Run once, check the result, then delete this file.

Run from your backend root (same place you run `alembic` commands) with:
    python test_notification.py
"""

from app.database.sessions import get_db
from app.desktop.services.superadmin_notifications import superadmin_notification_service as service
from app.desktop.schemas.superadmin_notifications.notification_enums import NotificationEventType

# get_db is a generator (FastAPI dependency) - grab one session from it manually
db = next(get_db())

try:
    rows = service.create_notification_for_all_superadmins(
        db=db,
        event_type=NotificationEventType.ACCOUNT_LOCKED,
        title="Test",
        message="Manual test row",
    )
    print(f"Inserted {len(rows)} row(s):")
    for row in rows:
        print(f"  - recipient_id={row.recipient_id}  notification_id={row.notification_id}")
finally:
    db.close()