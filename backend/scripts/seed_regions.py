# scripts/seed_regions.py

# 1. You need a database session to actually talk to Postgres.
#    Which function from your session.py gives you one? 
#    (Hint: not get_db — that one's a FastAPI dependency using `yield`,
#    built for request/response cycles, not a standalone script.
#    You'll need to call the session-maker directly instead.)
from app.database.sessions import SessionLocal

# 2. Import the model you're inserting rows into
from app.models.regions import Region


def seed_regions():
    db = SessionLocal()  # 3. create a session instance from the session-maker

    regions = [
        Region(region_name="National Capital Region", region_code="NCR"),
        Region(region_name="Region 3 — Central Luzon", region_code="RO3"),
        # add more here if you want additional regions for your demo
    ]

    db.add_all(regions)   # 4. which session method adds multiple objects at once?
    db.commit()           # 5. which method actually saves changes to Postgres?
    db.close()           # 6. always close the session when done — same pattern as get_db()


if __name__ == "__main__":
    seed_regions()