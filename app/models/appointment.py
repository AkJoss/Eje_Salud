import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.availability import AvailabilitySlot
    from app.models.specialty import Specialty


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class AppointmentRequest(Base):
    __tablename__ = "appointment_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.id"), nullable=False, index=True)
    preferred_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    message: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, native_enum=False, length=32),
        default=AppointmentStatus.pending,
        nullable=False,
        index=True,
    )
    availability_slot_id: Mapped[int | None] = mapped_column(
        ForeignKey("availability_slots.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    specialty: Mapped["Specialty"] = relationship(back_populates="appointment_requests")
    availability_slot: Mapped["AvailabilitySlot | None"] = relationship(
        foreign_keys=[availability_slot_id]
    )
