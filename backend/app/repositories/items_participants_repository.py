"""Модуль с запросами к базе данных для работы с встречами."""

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.schemas.receipts import FullReceiptParticipantCreate


def create(
        connection: Connection,
        receipt_item_id: int,
        participants: list[FullReceiptParticipantCreate],
        share_amount: float,
):
    values = [
    {
        "receipt_item_id": receipt_item_id,
        "participant_id": participant.participant_id,
        "share_amount": float(share_amount),
    }
    for participant in participants
    ]

    result = connection.execute(
        text("""
            INSERT INTO receipt_item_participants (receipt_item_id, participant_id, share_amount)
            VALUES (:receipt_item_id,:participant_id,:share_amount)
        """),
        values,
    )

    return values

def get_all_amount(
    connection: Connection,
    participant_id: int,
):
    result = connection.execute(
        text("""
                SELECT sum(share_amount)
                FROM receipt_item_participants as rip
                WHERE rip.participant_id = :participant_id
                """),
        {
            "participant_id": participant_id,
        },
    )

    return result.scalar_one()



def get_all_by_item_id(
    connection: Connection,
    receipt_item_id: int,
):
    result = connection.execute(
        text("""
            SELECT p.id,p.nickname,rip.share_amount
            FROM receipt_item_participants rip
            JOIN participants p
                ON p.id = rip.participant_id
            WHERE rip.receipt_item_id = :receipt_item_id
            ORDER BY p.id
        """),
        {
            "receipt_item_id": receipt_item_id,
        },
    )

    return result.mappings().all()


def replace_for_item(
    connection: Connection,
    receipt_item_id: int,
    participants: list[FullReceiptParticipantCreate],
    share_amount: float,
):
    connection.execute(
        text("""
            DELETE FROM receipt_item_participants
            WHERE receipt_item_id = :receipt_item_id
        """),
        {
            "receipt_item_id": receipt_item_id,
        },
    )

    if not participants:
        return []
    
    return create(
        connection=connection,
        receipt_item_id=receipt_item_id,
        participants=participants,
        share_amount=share_amount,
    )


def get_amounts_by_receipt_id(
    connection: Connection,
    receipt_id: int,
    payer_id:int
):
    """Возвращает распределённую сумму чека для каждого участника.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param payer_id: идентификатор плательщика.
    :return: список участников с распределёнными суммами.
    """
    result = connection.execute(
        text("""
            SELECT
                p.id AS participant_id,
                p.nickname,
                SUM(rip.share_amount) AS amount
            FROM receipt_item_participants rip
            JOIN receipt_items ri
                ON ri.id = rip.receipt_item_id
            JOIN participants p
                ON p.id = rip.participant_id
            WHERE ri.receipt_id = :receipt_id 
                AND p.id != :payer_id
            GROUP BY p.id, p.nickname
            ORDER BY p.id
        """),
        {
            "receipt_id": receipt_id,
            "payer_id": payer_id,
        },
    )

    return result.mappings().all()