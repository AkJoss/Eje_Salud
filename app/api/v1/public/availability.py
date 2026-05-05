from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.availability import AvailabilitySlot
from app.models.specialty import Specialty
from app.schemas.availability import AvailabilitySlotRead

router = APIRouter(prefix="/availability", tags=["public-availability"])


@router.get("", response_model=list[AvailabilitySlotRead])
def list_availability(
    slot_date: date = Query(..., description="Date to list slots for"),
    specialty_slug: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[AvailabilitySlot]:
    today = datetime.now(tz=UTC).date()
    if slot_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="slot_date must be today or in the future",
        )

    specialty_id: int | None = None
    if specialty_slug:
        spec = db.scalars(
            select(Specialty).where(Specialty.slug == specialty_slug, Specialty.is_active.is_(True))
        ).first()
        if spec is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")
        specialty_id = spec.id

    stmt = (
        select(AvailabilitySlot)
        .where(
            AvailabilitySlot.slot_date == slot_date,
            AvailabilitySlot.is_active.is_(True),
        )
        .order_by(AvailabilitySlot.start_time, AvailabilitySlot.id)
    )
    rows = list(db.scalars(stmt).all())
    if specialty_id is None:
        return rows
    return [r for r in rows if r.specialty_id is None or r.specialty_id == specialty_id]
