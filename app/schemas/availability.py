from datetime import date, datetime, time

from pydantic import BaseModel, Field


class AvailabilitySlotRead(BaseModel):
    id: int
    specialty_id: int | None
    slot_date: date
    start_time: time
    end_time: time
    is_active: bool

    model_config = {"from_attributes": True}


class AvailabilitySlotCreate(BaseModel):
    specialty_id: int | None = None
    slot_date: date
    start_time: time
    end_time: time
    is_active: bool = True


class AvailabilitySlotAdminUpdate(BaseModel):
    specialty_id: int | None = None
    slot_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    is_active: bool | None = None
