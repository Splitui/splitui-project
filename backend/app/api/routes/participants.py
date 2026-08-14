"""Модуль с эндпоинтами для работы с участниками встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.participants import ParticipantCreate, ParticipantUpdate
from app.services import participants_service

router = APIRouter(
    prefix="",
    tags=["Участники"],
)


@router.get("/meetings/{meeting_uuid}/participants", summary="Получить участников встречи")
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


@router.get("/meetings/{meeting_uuid}/participants/{participant_id}", summary="Получить участника встречи")
def get_participant(
        meeting_uuid: UUID,
        participant_id: int,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение данных конкретного участника встречи.

    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param connection: соединение с базой данных.
    :return: данные участника.
    """
    return participants_service.get_participant_from_meeting(connection, meeting_uuid, participant_id)


@router.post("/meetings/{meeting_uuid}/participants", status_code=201, summary="Добавить участника к встрече")
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


@router.patch("/meetings/{meeting_uuid}/participants/{participant_id}", summary="Обновить участника встречи")
def update_participant(
        meeting_uuid: UUID,
        participant_id: int,
        data: ParticipantUpdate,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на частичное обновление данных участника встречи.

    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param data: данные для обновления участника.
    :param connection: соединение с базой данных.
    :return: обновлённые данные участника.
    """
    return participants_service.update_participant(connection, meeting_uuid, participant_id, data)
