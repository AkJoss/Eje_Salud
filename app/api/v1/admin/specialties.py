from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyAdminCreate, SpecialtyAdminUpdate, SpecialtyRead

router = APIRouter(prefix="/admin/specialties", tags=["admin-specialties"])


@router.get("", response_model=list[SpecialtyRead])
def admin_list_specialties(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> list[Specialty]:
    stmt = select(Specialty).order_by(Specialty.sort_order, Specialty.id)
    return list(db.scalars(stmt).all())


@router.post("", response_model=SpecialtyRead, status_code=status.HTTP_201_CREATED)
def admin_create_specialty(
    payload: SpecialtyAdminCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Specialty:
    exists = db.scalars(select(Specialty).where(Specialty.slug == payload.slug)).first()
    if exists is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    entity = Specialty(
        slug=payload.slug.strip(),
        name=payload.name.strip(),
        description=payload.description.strip(),
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


@router.patch("/{specialty_id}", response_model=SpecialtyRead)
def admin_update_specialty(
    specialty_id: int,
    payload: SpecialtyAdminUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> Specialty:
    entity = db.scalars(select(Specialty).where(Specialty.id == specialty_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is not None:
        other = db.scalars(select(Specialty).where(Specialty.slug == data["slug"], Specialty.id != specialty_id)).first()
        if other is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    for key, value in data.items():
        if value is None:
            continue
        setattr(entity, key, value.strip() if isinstance(value, str) else value)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


@router.delete("/{specialty_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_specialty(
    specialty_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    entity = db.scalars(select(Specialty).where(Specialty.id == specialty_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")
    try:
        db.delete(entity)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete specialty with related records",
        ) from None
