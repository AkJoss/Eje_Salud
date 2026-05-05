from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=5, max_length=40)
    email: EmailStr
    specialty_slug: str = Field(..., min_length=2, max_length=80)
    preferred_date: date | None = None
    preferred_time: str | None = Field(default=None, max_length=20)
    message: str = Field(default="", max_length=5000)
    availability_slot_id: int | None = None


class AppointmentRead(BaseModel):
    id: int
    patient_name: str
    phone: str
    email: str
    specialty_id: int
    preferred_date: date | None
    preferred_time: str | None
    message: str
    status: AppointmentStatus
    availability_slot_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppointmentAdminUpdate(BaseModel):
    status: AppointmentStatus | None = None
    preferred_date: date | None = None
    preferred_time: str | None = Field(default=None, max_length=20)
    message: str | None = Field(default=None, max_length=5000)
