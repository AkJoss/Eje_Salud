from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.appointment import AppointmentRequest, AppointmentStatus
from app.schemas.appointment import AppointmentAdminUpdate, AppointmentRead

router = APIRouter(prefix="/admin/appointment-requests", tags=["admin-appointments"])


@router.get("", response_model=list[AppointmentRead])
def list_appointment_requests(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    status_filter: AppointmentStatus | None = Query(None, alias="status"),
    specialty_id: int | None = Query(None),
) -> list[AppointmentRequest]:
    stmt = select(AppointmentRequest).order_by(AppointmentRequest.created_at.desc())
    if status_filter is not None:
        stmt = stmt.where(AppointmentRequest.status == status_filter)
    if specialty_id is not None:
        stmt = stmt.where(AppointmentRequest.specialty_id == specialty_id)
    return list(db.scalars(stmt).all())


@router.patch("/{appointment_id}", response_model=AppointmentRead)
def update_appointment_request(
    appointment_id: int,
    payload: AppointmentAdminUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AppointmentRequest:
    entity = db.scalars(select(AppointmentRequest).where(AppointmentRequest.id == appointment_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(entity, key, value)
    entity.updated_at = datetime.now(tz=UTC)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity
