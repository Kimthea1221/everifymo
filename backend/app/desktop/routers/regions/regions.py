from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.database.sessions import get_db
from backend.app.models.regions import Region
from backend.app.desktop.schemas.regions.regions import RegionOut

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("", response_model=list[RegionOut])
async def list_regions(db: Session = Depends(get_db)):
    db.execute(text("SET app.bypass_rls = 'true'"))
    return db.query(Region).order_by(Region.region_name).all()