"""Модуль с эндпоинтами для работы с долгами участников встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends, Header
from sqlalchemy.engine import Connection

from app.api.dependencies import get_meeting_for_participant
from app.db.dependencies import get_connection
from app.services import debts_service

router = APIRouter(
    prefix="",
    tags=["Долги"]
)


@router.get("/meetings/{meeting_uuid}/debts", summary="Получить долги участников встречи")
def get_debts(
        meeting: dict = Depends(get_meeting_for_participant),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка долгов участников встречи.

    :param meeting: данные встречи.
    :param connection: соединение с базой данных.
    :return: список долгов участников встречи.
    """
    return debts_service.get_debts(connection, meeting["id"])


@router.post("/meetings/{meeting_uuid}/debts", summary="Посчитать долги")
def calculate_debts(
        meeting_uuid: UUID,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на подсчетов долгов участников встречи.

    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: подсчитанный список долгов участников встречи.
    """
    return debts_service.calculate_debts(connection, meeting_uuid, session_id)


@router.get("/meetings/{meeting_uuid}/debts/{debt_id}/payment", summary="Получить данные для оплаты долга")
def get_debt_payment_info(
        meeting_uuid: UUID,
        debt_id: int,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на получение данных для оплаты долга.

    :param meeting_uuid: UUID встречи.
    :param debt_id: идентификатор долга.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: сумма и реквизиты получателя.
    """
    return debts_service.get_debt_payment_info(connection, meeting_uuid, session_id, debt_id)


@router.post("/meetings/{meeting_uuid}/debts/{debt_id}/confirm", summary="Отметить долг как оплаченный")
def confirm_debt(
        meeting_uuid: UUID,
        debt_id: int,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на отметку долга как оплаченного.

    :param meeting_uuid: UUID встречи.
    :param debt_id: идентификатор долга.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: обновлённые данные долга.
    """
    return debts_service.confirm_debt(connection, meeting_uuid, session_id, debt_id)
