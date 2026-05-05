from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.specialty import Specialty

DEFAULT_SPECIALTIES: list[dict[str, str | int]] = [
    {"slug": "medico-general", "name": "Médico general", "description": "", "sort_order": 10},
    {"slug": "radiologia", "name": "Radiología", "description": "", "sort_order": 20},
    {"slug": "psicologia", "name": "Psicología", "description": "", "sort_order": 30},
    {"slug": "podologia", "name": "Podología", "description": "", "sort_order": 40},
    {"slug": "medicina-integral", "name": "Medicina integral", "description": "", "sort_order": 50},
]


def seed_specialties_if_empty(db: Session) -> None:
    if db.scalars(select(Specialty)).first() is not None:
        return
    for row in DEFAULT_SPECIALTIES:
        db.add(
            Specialty(
                slug=str(row["slug"]),
                name=str(row["name"]),
                description=str(row["description"]),
                sort_order=int(row["sort_order"]),
                is_active=True,
            )
        )
    db.commit()
