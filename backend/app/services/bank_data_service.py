from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection
from app.db.dependencies import transaction
from app.repositories import bank_data_repository
from app.schemas.bank_data import BankDataCreate
from app.services import meetings_service, participants_service


@transaction
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
    return bank_data_repository.create(
        connection,
        participant["id"],
        data.bank_id,
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