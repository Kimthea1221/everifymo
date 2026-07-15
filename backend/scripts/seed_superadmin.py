"""Seed script: create a test superadmin account for login testing.

Run this once to create a superadmin you can log in with via
POST /auth/superadmin/login. Update TEST_EMAIL/TEST_PASSWORD below
if you want different credentials.
"""
from app.database.sessions import SessionLocal
from app.core.security import hash_password
from app.models.users import User


TEST_EMAIL = "icecreamnpizza0@gmail.com"
TEST_PASSWORD = "TestPassword123!"


def main():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == TEST_EMAIL).first()
        if existing:
            print(f"Superadmin already exists: {existing.email}")
            return

        user = User(
            email=TEST_EMAIL,
            password_hash=hash_password(TEST_PASSWORD),
            role="superadmin",
            is_active=True,
            is_locked=False,
            force_password_change=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Created superadmin: {user.email}")
        print(f"Password: {TEST_PASSWORD}")
        print("You can now test POST /auth/superadmin/login with these credentials.")

    finally:
        db.close()


if __name__ == "__main__":
    main()