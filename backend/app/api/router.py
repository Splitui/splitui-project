from fastapi import APIRouter

from app.api.routes.meetings import router as meetings_router
from app.api.routes.participants import router as participants_router

api_router = APIRouter()

api_router.include_router(meetings_router)
api_router.include_router(participants_router)
