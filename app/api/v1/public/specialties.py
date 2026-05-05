from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyRead

router = APIRouter(prefix="/specialties", tags=["public-specialties"])


@router.get("", response_model=list[SpecialtyRead])
def list_specialties(db: Session = Depends(get_db)) -> list[Specialty]:
    stmt = select(Specialty).where(Specialty.is_active.is_(True)).order_by(Specialty.sort_order, Specialty.id)
    return list(db.scalars(stmt).all())


@router.get("/{slug}", response_model=SpecialtyRead)
def get_specialty_by_slug(slug: str, db: Session = Depends(get_db)) -> Specialty:
    spec = db.scalars(select(Specialty).where(Specialty.slug == slug, Specialty.is_active.is_(True))).first()
    if spec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specialty not found")
    return spec
