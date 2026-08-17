"""Модуль с эндпоинтами для работы с банковскими реквизитами."""

from uuid import UUID

from fastapi import APIRouter, Depends, Header
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.bank_data import BankDataCreate
from app.services import bank_data_service

router = APIRouter(
    prefix="",
    tags=["Банковские реквизиты"]
)


@router.get("/banks", summary="Получить список всех банков")
def get_banks(
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка банков.

    :param connection: соединение с базой данных.
    :return: список банков.
    """
    return bank_data_service.get_banks(connection)


@router.get(
    "/meetings/{meeting_uuid}/participants/{participant_id}/bank_data",
    summary="Получить банковские реквизиты участника"
)
def get_bank_data(
        meeting_uuid: UUID,
        participant_id: int,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение банковских реквизитов конкретного участника.

    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: данные банковских реквизитах участника.
    """
    return bank_data_service.get_bank_data(connection, meeting_uuid, session_id, participant_id)


@router.post(
    "/meetings/{meeting_uuid}/participants/{participant_id}/bank_data",
    summary="Добавить банковские реквизиты",
    status_code=201
)
def add_bank_data(
        meeting_uuid: UUID,
        participant_id: int,
        data: BankDataCreate,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на добавление банковских реквизитов для участника.

    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param data: данные для создания банковских реквизитов.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: данные банковских реквизитов участника.
    """
    return bank_data_service.add_bank_data(connection, meeting_uuid, session_id, participant_id, data)
