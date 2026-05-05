from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.availability import AvailabilitySlot
from app.models.specialty import Specialty
from app.schemas.availability import AvailabilitySlotAdminUpdate, AvailabilitySlotCreate, AvailabilitySlotRead

router = APIRouter(prefix="/admin/availability-slots", tags=["admin-availability"])


@router.get("", response_model=list[AvailabilitySlotRead])
def list_slots(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    from_date: date | None = Query(None, description="Return slots with slot_date on or after this date"),
    specialty_id: int | None = Query(None),
) -> list[AvailabilitySlot]:
    stmt = select(AvailabilitySlot).order_by(AvailabilitySlot.slot_date, AvailabilitySlot.start_time)
    if from_date is not None:
        stmt = stmt.where(AvailabilitySlot.slot_date >= from_date)
    if specialty_id is not None:
        stmt = stmt.where(AvailabilitySlot.specialty_id == specialty_id)
    return list(db.scalars(stmt).all())


@router.post("", response_model=AvailabilitySlotRead, status_code=status.HTTP_201_CREATED)
def create_slot(
    payload: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AvailabilitySlot:
    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_time must be before end_time")
    if payload.specialty_id is not None:
        spec = db.scalars(select(Specialty).where(Specialty.id == payload.specialty_id)).first()
        if spec is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    now = datetime.now(tz=UTC)
    entity = AvailabilitySlot(
        specialty_id=payload.specialty_id,
        slot_date=payload.slot_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_active=payload.is_active,
        created_at=now,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


@router.patch("/{slot_id}", response_model=AvailabilitySlotRead)
def update_slot(
    slot_id: int,
    payload: AvailabilitySlotAdminUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AvailabilitySlot:
    entity = db.scalars(select(AvailabilitySlot).where(AvailabilitySlot.id == slot_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")

    data = payload.model_dump(exclude_unset=True)
    if "specialty_id" in data and data["specialty_id"] is not None:
        spec = db.scalars(select(Specialty).where(Specialty.id == data["specialty_id"])).first()
        if spec is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    start = data.get("start_time", entity.start_time)
    end = data.get("end_time", entity.end_time)
    if start >= end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_time must be before end_time")

    for key, value in data.items():
        if value is None and key != "specialty_id":
            continue
        setattr(entity, key, value)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    entity = db.scalars(select(AvailabilitySlot).where(AvailabilitySlot.id == slot_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    try:
        db.delete(entity)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete slot referenced by appointments",
        ) from None
