"""Модуль с эндпоинтами журнала изменений встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.services import change_log_service


router = APIRouter(
    prefix="/meetings",
    tags=["История изменений"],
)


@router.get(
    "/{meeting_uuid}/changes",
    summary="Получить историю изменений встречи",
)
def get_meeting_changes(
    meeting_uuid: UUID,
    limit: int,
    offset: int,
    connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос истории изменений встречи.

    :param meeting_uuid: UUID встречи.
    :param limit: максимальное количество изменений в ответе.
    :param offset: смещение от начала списка изменений.
    :param connection: соединение с базой данных.
    :return: список изменений встречи.
    """
    return change_log_service.get_changes_from_meeting(
        connection=connection,
        meeting_uuid=meeting_uuid,
        num_limit=limit,
        num_offset=offset,
    )