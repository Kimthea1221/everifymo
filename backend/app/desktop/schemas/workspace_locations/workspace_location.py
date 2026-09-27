# backend/app/desktop/schemas/workspace_locations/workspace_location.py
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WorkspaceLocationSaveRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    radius_meters: int = Field(500, gt=0, le=50000, description="Geofence radius in meters")


class WorkspaceLocationResponse(BaseModel):
    workspace_location_id: uuid.UUID
    agency: str
    region_id: uuid.UUID
    region: Optional[str] = None
    latitude: float
    longitude: float
    radius_meters: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True
