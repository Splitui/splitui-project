"""Модуль с бизнес-логикой для работы с банковскими реквизитами."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import bank_data_repository
from app.schemas.bank_data import BankDataCreate
from app.services import meetings_service, participants_service
from app.services.change_log_service import change_log, parse_bank_data_context


@transaction
@change_log(
    action="bank_data.updated",
    context_parser=parse_bank_data_context,
)
def add_bank_data(connection: Connection, meeting_uuid: UUID, participant_id: int, data: BankDataCreate):
    """Добавляет банковские реквизиты участника.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param data: данные для создания банковских реквизитов.
    :return: данные банковских реквизитов.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = participants_service.get_participant_or_error(connection, meeting["id"], participant_id)
    bank = get_bank_or_error(connection, data.bank_id)
    return bank_data_repository.create(
        connection,
        participant["id"],
        bank["id"],
        data.card_number,
        data.phone_number
    )


def get_bank_data(connection: Connection, meeting_uuid: UUID, participant_id: int):
    """Возвращает банковские реквизиты участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :return: данные банковских реквизитов участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = participants_service.get_participant_or_error(connection, meeting["id"], participant_id)
    bank_data = bank_data_repository.get_bank_data_by_participant_id(connection, participant["id"])
    if bank_data is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Не найдены данные о банковских реквизитах участника с id {participant_id}"
            }
        )
    return bank_data


def get_banks(connection: Connection):
    """Возвращает список всех доступных банков.

    :param connection: соединение с базой данных.
    :return: список банков.
    """
    return bank_data_repository.get_banks(connection)


def get_bank_or_error(connection: Connection, bank_id: int) -> dict:
    """Возвращает данные банка по id или бросает 404, если он не найден.

    :param connection: соединение с базой данных.
    :param bank_id: идентификатор банка.
    :return: данные банка.
    :raises HTTPException: 404, если банк не найден.
    """
    bank = bank_data_repository.get_bank_by_id(connection, bank_id)
    if bank is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Не найден банк с id {bank_id}"
            }
        )
    return bank
