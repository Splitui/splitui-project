"""Модуль с эндпоинтами для работы с участниками встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.participants import ParticipantCreate
from app.services import participants_service

router = APIRouter(
    prefix="",
    tags=["Участники"],
)


@router.get("/{meeting_uuid}/participants", summary="Получить участников встречи")
def get_participants(
        meeting_uuid: UUID,
        limit: int,
        offset: int,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка участников встречи.

    :param meeting_uuid: UUID встречи.
    :param limit: максимальное количество участников в ответе.
    :param offset: смещение относительно начала списка участников.
    :param connection: соединение с базой данных.
    :return: список данных участников встречи.
    """
    return participants_service.get_participants_from_meeting(
        connection,
        meeting_uuid,
        limit,
        offset
    )


@router.post("/{meeting_uuid}/participants", summary="Добавить участника к встрече")
def add_participant(
        meeting_uuid: UUID,
        data: ParticipantCreate,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на добавление участника к встрече.

    :param meeting_uuid: UUID встречи.
    :param data: данные для создания участника.
    :param connection: соединение с базой данных.
    :return: данные созданного участника.
    """
    return participants_service.add_participant(connection, meeting_uuid, data)
