from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.appointment import AppointmentRequest, AppointmentStatus
from app.models.availability import AvailabilitySlot
from app.models.specialty import Specialty
from app.schemas.appointment import AppointmentCreate, AppointmentRead

router = APIRouter(prefix="/appointment-requests", tags=["public-appointments"])


def _validate_slot_for_booking(
    db: Session,
    *,
    slot_id: int,
    specialty: Specialty,
) -> AvailabilitySlot:
    slot = db.scalars(select(AvailabilitySlot).where(AvailabilitySlot.id == slot_id)).first()
    if slot is None or not slot.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid availability slot")
    if slot.specialty_id is not None and slot.specialty_id != specialty.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Availability slot does not match specialty",
        )
    today = datetime.now(tz=UTC).date()
    if slot.slot_date < today:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slot date is in the past")
    return slot


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().rate_limit_write)
def create_appointment_request(
    request: Request,
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
) -> AppointmentRequest:
    spec = db.scalars(
        select(Specialty).where(Specialty.slug == payload.specialty_slug, Specialty.is_active.is_(True))
    ).first()
    if spec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    slot: AvailabilitySlot | None = None
    if payload.availability_slot_id is not None:
        slot = _validate_slot_for_booking(db, slot_id=payload.availability_slot_id, specialty=spec)
        if payload.preferred_date is not None and payload.preferred_date != slot.slot_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="preferred_date must match the selected availability slot date",
            )

    now = datetime.now(tz=UTC)
    entity = AppointmentRequest(
        patient_name=payload.patient_name.strip(),
        phone=payload.phone.strip(),
        email=str(payload.email).strip().lower(),
        specialty_id=spec.id,
        preferred_date=payload.preferred_date if payload.preferred_date is not None else (
            slot.slot_date if slot else None
        ),
        preferred_time=payload.preferred_time,
        message=payload.message.strip(),
        status=AppointmentStatus.pending,
        availability_slot_id=payload.availability_slot_id,
        created_at=now,
        updated_at=now,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity
