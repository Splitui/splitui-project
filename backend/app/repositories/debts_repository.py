"""Модуль с запросами к базе данных для работы с долгами участников встречи."""

from datetime import datetime, UTC

from sqlalchemy import text
from sqlalchemy.engine import Connection


def get_all_by_meeting(connection: Connection, meeting_id: int):
    """Возвращает все долги участников указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: данные долгов участников встречи.
    """
    result = connection.execute(
        text("""
             SELECT d.id,
                    d.debtor_id,
                    debtor.nickname   AS debtor_nickname,
                    d.creditor_id,
                    creditor.nickname AS creditor_nickname,
                    d.amount,
                    d.created_at,
                    d.is_paid,
                    d.paid_at
             FROM debts d
                      JOIN participants debtor ON debtor.id = d.debtor_id
                      JOIN participants creditor ON creditor.id = d.creditor_id
             WHERE d.meeting_id = :meeting_id
             ORDER BY d.id
             """),
        {"meeting_id": meeting_id}
    )
    return [dict(row) for row in result.mappings().all()]


def calculate_for_meeting(connection: Connection, meeting_id: int, debts: list[dict]):
    """Возвращает подсчитанные долги участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param debts: список новых долгов.
    :return: данные долгов участников встречи.
    """
    connection.execute(
        text("DELETE FROM debts WHERE meeting_id = :meeting_id"),
        {"meeting_id": meeting_id}
    )

    values = [
        {
            "meeting_id": meeting_id,
            "debtor_id": debt["debtor_id"],
            "creditor_id": debt["creditor_id"],
            "amount": float(debt["amount"]),
        }
        for debt in debts
    ]

    connection.execute(
        text("""
             INSERT INTO debts (meeting_id, debtor_id, creditor_id, amount)
             VALUES (:meeting_id, :debtor_id, :creditor_id, :amount)
             """),
        values
    )


def mark_as_paid(connection: Connection, debt_id: int):
    """Отмечает долг как погашенный.

    :param connection: соединение с базой данных.
    :param debt_id: идентификатор долга.
    :return: обновлённые данные долга.
    """
    result = connection.execute(
        text("""
             UPDATE debts
             SET is_paid = 1, 
                 paid_at = :paid_at
             WHERE id = :debt_id
             RETURNING *
             """),
        {
            "debt_id": debt_id,
            "paid_at": datetime.now(UTC).isoformat()
        }
    )
    return dict(result.mappings().one())


def get_by_id(connection: Connection, meeting_id: int, debt_id: int):
    """Возвращает долг по id в рамках конкретной встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param debt_id: идентификатор долга.
    :return: данные долга или None, если не найден.
    """
    result = connection.execute(
        text("SELECT * FROM debts WHERE id = :debt_id AND meeting_id = :meeting_id"),
        {
            "debt_id": debt_id,
            "meeting_id": meeting_id
        }
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


def count_unpaid_for_meeting(connection: Connection, meeting_id: int) -> int:
    """Возвращает количество непогашенных долгов встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: количество непогашенных долгов.
    """
    result = connection.execute(
        text("SELECT COUNT(*) FROM debts WHERE meeting_id = :meeting_id AND is_paid = 0"),
        {"meeting_id": meeting_id}
    )
    return result.scalar_one()


def count_unpaid_for_participant(connection: Connection, meeting_id: int, participant_id: int):
    """Возвращает количество непогашенных долгов встречи, где участник - должник или кредитор.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param participant_id: идентификатор участника.
    :return: количество непогашенных долгов.
    """
    result = connection.execute(
        text("""
             SELECT COUNT(*)
             FROM debts
             WHERE meeting_id = :meeting_id
               AND is_paid = 0
               AND (debtor_id = :participant_id OR creditor_id = :participant_id)
             """),
        {"meeting_id": meeting_id, "participant_id": participant_id}
    )
    return result.scalar_one()


def get_balances_by_meeting(connection: Connection, meeting_id: int):
    """Возвращает балансы участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: список данных балансов участников.
    """
    result = connection.execute(
        text("""
             SELECT p.id AS participant_id, COALESCE(creditors.total, 0) - COALESCE(debtors.total, 0) AS balance
             FROM participants p
             LEFT JOIN (
                  SELECT payer_id, SUM(total_amount) AS total
                  FROM receipts
                  WHERE meeting_id = :meeting_id
                  GROUP BY payer_id
             ) creditors ON creditors.payer_id = p.id
             LEFT JOIN (
                  SELECT rip.participant_id, SUM(rip.share_amount) AS total
                  FROM receipt_item_participants rip
                      JOIN receipt_items ri ON ri.id = rip.receipt_item_id
                      JOIN receipts r ON r.id = ri.receipt_id
                  WHERE r.meeting_id = :meeting_id
                  GROUP BY rip.participant_id
             ) debtors ON debtors.participant_id = p.id
             WHERE p.meeting_id = :meeting_id
             """),
        {"meeting_id": meeting_id}
    )
    return [dict(row) for row in result.mappings().all()]
