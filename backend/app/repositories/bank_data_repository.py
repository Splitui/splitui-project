"""Модуль с запросами к базе данных для работы с банковскими реквизитами."""

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        participant_id: int,
        bank_id: int,
        card_number: str | None,
        phone_number: str | None
):
    """Создает запись о банковских реквизитах участника.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param bank_id: идентификатор банка.
    :param card_number: номер банковской карты.
    :param phone_number: номер телефона.
    :return:
    """
    result = connection.execute(
        text("""
             INSERT INTO bank_data (participant_id, bank_id, card_number, phone_number)
             VALUES (:participant_id, :bank_id, :card_number,
                     :phone_number) RETURNING id, bank_id, card_number, phone_number
             """),
        {
            "participant_id": participant_id,
            "bank_id": bank_id,
            "card_number": card_number,
            "phone_number": phone_number
        },
    )
    return result.mappings().one()


def update(
        connection: Connection,
        participant_id: int,
        bank_id: int,
        card_number: str | None,
        phone_number: str | None
):
    """Обновляет банковские реквизиты участника.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param bank_id: идентификатор банка.
    :param card_number: номер банковской карты.
    :param phone_number: номер телефона.
    :return: обновлённые данные банковских реквизитов.
    """
    result = connection.execute(
        text("""
             UPDATE bank_data
             SET bank_id      = :bank_id,
                 card_number  = :card_number,
                 phone_number = :phone_number
             WHERE participant_id = :participant_id RETURNING *
             """),
        {
            "participant_id": participant_id,
            "bank_id": bank_id,
            "card_number": card_number,
            "phone_number": phone_number
        },
    )
    return result.mappings().one_or_none()


def get_bank_data_by_participant_id(connection: Connection, participant_id: int):
    """Возвращает банковские реквизиты участника по его идентификатору.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :return: данные банковских реквизитов участника.
    """
    result = connection.execute(
        text("""
             SELECT *
             FROM bank_data
             WHERE participant_id = :participant_id
             """),
        {
            "participant_id": participant_id
        }
    )
    return result.mappings().one_or_none()


def get_banks(connection: Connection):
    """Возвращает список всех доступных банков.

    :param connection: соединение с базой данных.
    :return: список банков.
    """
    result = connection.execute(
        text("""
             SELECT *
             FROM banks
             ORDER BY id
             """)
    )
    return result.mappings().all()
