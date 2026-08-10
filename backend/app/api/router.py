"""Модуль сборки всех роутеров API в единый роутер приложения."""

from fastapi import APIRouter

from app.api.routes.meetings import router as meetings_router
from app.api.routes.participants import router as participants_router
from app.api.routes.receipt_items import router as receipt_items_router
from app.api.routes.receipts import router as receipt_router
from app.api.routes.items_participants import router as items_participants_router

api_router = APIRouter()

api_router.include_router(meetings_router)
api_router.include_router(participants_router)
api_router.include_router(receipt_router)
api_router.include_router(receipt_items_router)
api_router.include_router(items_participants_router)
