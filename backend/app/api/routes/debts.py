"""Модуль с эндпоинтами для работы с долгами участников встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.services import debts_service

router = APIRouter(
    prefix="",
    tags=["Долги"]
)


@router.get("/meetings/{meeting_uuid}/debts", summary="Получить долги участников встречи")
def get_debts(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка долгов участников встречи.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: список долгов участников встречи.
    """
    return debts_service.get_debts(connection, meeting_uuid)


@router.post("/meetings/{meeting_uuid}/debts", summary="Посчитать долги")
def calculate_debts(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на подсчетов долгов участников встречи.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: подсчитанный список долгов участников встречи.
    """
    return debts_service.calculate_debts(connection, meeting_uuid)
