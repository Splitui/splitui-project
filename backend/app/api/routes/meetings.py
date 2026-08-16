"""Модуль с эндпоинтами для работы со встречами."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.meetings import MeetingCreate, MeetingUpdate, MeetingFinish
from app.services import meetings_service

router = APIRouter(
    prefix="/meetings",
    tags=["Встречи"],
)


@router.get("", summary="Получить список всех встреч")
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


@router.get("/{meeting_uuid}", summary="Получить информацию по встрече")
def get_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение информации о встрече.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: данные встречи.
    """
    return meetings_service.get_meeting_or_error(connection, meeting_uuid)

@router.post("", status_code=201, summary="Создать встречу")
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


@router.patch("/{meeting_uuid}", summary="Обновить встречу")
def update_meeting(
        meeting_uuid: UUID,
        data: MeetingUpdate,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на частичное обновление встречи.

    :param meeting_uuid: UUID встречи.
    :param data: данные для обновления встречи.
    :param connection: соединение с базой данных.
    :return: обновлённые данные встречи.
    """
    return meetings_service.update_meeting(connection, meeting_uuid, data)

@router.post("/{meeting_uuid}/calculate", summary="Начать расчёт встречи")
def calculate_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос перехода встречи в статус 'В расчёте'.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: обновленные данные встречи.
    """
    return meetings_service.calculate_meeting(connection, meeting_uuid)

@router.post("/{meeting_uuid}/finish", summary="Завершить встречу")
def finish_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос перехода встречи в статус 'Завершена'.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: обновленные данные встречи.
    """
    return meetings_service.finish_meeting(connection, meeting_uuid)

@router.post("/{meeting_uuid}/edit", summary="Вернуть встречу к корректировкам")
def edit_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос перехода встречи в статус 'Корректировка'.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: обновленные данные встречи.
    """
    return meetings_service.edit_meeting(connection, meeting_uuid)