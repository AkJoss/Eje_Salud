from fastapi import APIRouter

from app.api.v1.admin import appointments as admin_appointments
from app.api.v1.admin import auth as admin_auth
from app.api.v1.admin import availability as admin_availability
from app.api.v1.admin import contact as admin_contact
from app.api.v1.admin import specialties as admin_specialties
from app.api.v1.public import appointments as public_appointments
from app.api.v1.public import availability as public_availability
from app.api.v1.public import contact as public_contact
from app.api.v1.public import specialties as public_specialties

api_router = APIRouter()

api_router.include_router(public_specialties.router)
api_router.include_router(public_availability.router)
api_router.include_router(public_appointments.router)
api_router.include_router(public_contact.router)

api_router.include_router(admin_auth.router)
api_router.include_router(admin_appointments.router)
api_router.include_router(admin_specialties.router)
api_router.include_router(admin_availability.router)
api_router.include_router(admin_contact.router)
