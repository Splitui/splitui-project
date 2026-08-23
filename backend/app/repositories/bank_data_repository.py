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
    :return: данные банковских реквизитов.
    """
    result = connection.execute(
        text("""
             INSERT INTO bank_data (participant_id, bank_id, card_number, phone_number)
             VALUES (:participant_id, :bank_id, :card_number, :phone_number) RETURNING *
             """),
        {
            "participant_id": participant_id,
            "bank_id": bank_id,
            "card_number": card_number,
            "phone_number": phone_number
        },
    )
    return dict(result.mappings().one())


def upsert(
        connection: Connection,
        participant_id: int,
        bank_id: int,
        card_number: str | None,
        phone_number: str | None
):
    """Создаёт или обновляет банковские реквизиты участника (upsert).

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param bank_id: идентификатор банка.
    :param card_number: номер банковской карты.
    :param phone_number: номер телефона.
    :return: данные банковских реквизитов после вставки/обновления.
    """
    result = connection.execute(
        text("""
             INSERT INTO bank_data (participant_id, bank_id, card_number, phone_number)
             VALUES (:participant_id, :bank_id, :card_number, :phone_number) ON CONFLICT (participant_id)
             DO
             UPDATE SET
                 bank_id = excluded.bank_id,
                 card_number = excluded.card_number,
                 phone_number = excluded.phone_number
                 RETURNING id, participant_id, bank_id, card_number, phone_number
             """),
        {
            "participant_id": participant_id,
            "bank_id": bank_id,
            "card_number": card_number,
            "phone_number": phone_number
        },
    )
    return dict(result.mappings().one())


def delete_by_participant_id(connection: Connection, participant_id: int):
    """Удаляет банковские реквизиты участника, если они есть.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    """
    connection.execute(
        text("DELETE FROM bank_data WHERE participant_id = :participant_id"),
        {"participant_id": participant_id}
    )


def get_bank_data_by_participant_id(connection: Connection, participant_id: int):
    """Возвращает банковские реквизиты участника по его идентификатору.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :return: данные банковских реквизитов участника.
    """
    result = connection.execute(
        text("""
             SELECT bd.id as bank_data_id, bd.card_number, bd.phone_number, b.id as bank_id, b.name AS bank_name
             FROM bank_data bd
                      JOIN banks b ON b.id = bd.bank_id
             WHERE bd.participant_id = :participant_id
             """),
        {
            "participant_id": participant_id
        }
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


def get_banks(connection: Connection):
    """Возвращает список всех доступных банков.

    :param connection: соединение с базой данных.
    :return: список банков.
    """
    result = connection.execute(
        text("""
             SELECT id, name
             FROM banks
             ORDER BY id
             """)
    )
    return result.mappings().all()


def get_bank_by_id(connection: Connection, bank_id: int):
    """Возвращает данные банка по его идентификатору.

    :param connection: соединение с базой данных.
    :param bank_id: идентификатор банка.
    :return: данные банка.
    """
    result = connection.execute(
        text("""
             SELECT *
             FROM banks
             WHERE id = :bank_id
             """),
        {
            "bank_id": bank_id
        }
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None
