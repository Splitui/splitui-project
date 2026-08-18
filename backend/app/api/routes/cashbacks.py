"""Модуль с эндпоинтами для работы с кешбэками."""
from uuid import UUID

from fastapi import APIRouter, Depends, Header
from sqlalchemy.engine import Connection

from app.api.dependencies import get_meeting_for_participant
from app.db.dependencies import get_connection
from app.schemas.cashbacks import ParticipantCashbackCategoriesUpdate
from app.services import cashback_service

router = APIRouter(
    prefix="",
    tags=["Категории кешбэка"]
)


@router.get("/cashback-categories", summary="Получить список категорий кешбэка")
def get_all_categories(
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка категорий кешбэка.

    :param connection: соединение с базой данных.
    :return: список категорий кешбэка.
    """
    return cashback_service.get_all_categories(connection)


@router.get(
    "/meetings/{meeting_uuid}/cashback-categories",
    summary="Получить категории кешбека участника",
)
def get_cashback_categories(
        meeting_uuid: UUID,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на получение категорий кешбека участника.

    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: список категорий кешбека участника.
    """
    return cashback_service.get_cashback_categories(connection, meeting_uuid, session_id)


@router.put(
    "/meetings/{meeting_uuid}/cashback-categories",
    summary="Обновить категории кешбека участника",
)
def update_cashback_categories(
        meeting_uuid: UUID,
        data: ParticipantCashbackCategoriesUpdate,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на полную замену категорий кешбека участника.

    :param meeting_uuid: UUID встречи.
    :param data: новый список категорий кешбека с процентами.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: актуальный список категорий кешбека участника.
    """
    return cashback_service.update_cashback_categories(connection, meeting_uuid, session_id, data)


@router.get(
    "/meetings/{meeting_uuid}/cashback-categories/{category_id}",
    summary="Получить участников с лучшим кешбеком по категории",
)
def get_best_cashback(
        category_id: int,
        meeting: dict = Depends(get_meeting_for_participant),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на получение списка участников с лучшим кешбеком по категории.

    :param category_id: идентификатор категории кешбека.
    :param meeting: данные встречи.
    :param connection: соединение с базой данных.
    :return: список участников, отсортированных по проценту кешбека по убыванию.
    """
    return cashback_service.get_best_cashback(connection, meeting["id"], category_id)
