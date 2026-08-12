"""Модуль с эндпоинтами для работы со встречами."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.meetings import MeetingCreate, MeetingResponse
from app.services import meetings_service

router = APIRouter(
    prefix="/meetings",
    tags=["Встречи"],
)


@router.get("", summary="Получить список всех встреч", response_model=list[MeetingResponse])
def get_meetings(
        limit: int,
        offset: int,
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на получение списка всех встреч.

    :param limit: максимальное количество встреч в ответе.
    :param offset: смещение относительно начала списка встреч.
    :param connection: соединение с базой данных.
    :return: список данных о встречах.
    """
    return meetings_service.get_meetings(connection, limit, offset)


@router.get("/{meeting_uuid}", summary="Получить информацию по встрече", response_model=MeetingResponse)
def get_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение информации о встрече.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: данные встречи.
    """
    return meetings_service.get_meeting(connection, meeting_uuid)


@router.post("", status_code=201, summary="Создать встречу", response_model=MeetingResponse)
def create_meeting(
        data: MeetingCreate,
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на создание встречи.

    :param data: данные для создания встречи.
    :param connection: соединение с базой данных.
    :return: данные созданной встречи.
    """
    return meetings_service.create_meeting(connection, data)
