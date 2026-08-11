"""Модуль с запросами к базе данных для работы с встречами."""

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.schemas.receipts import FullReceiptParticipantCreate


def create(
        connection: Connection,
        receipt_item_id: int,
        participants: list[FullReceiptParticipantCreate],
        unit_price: float,
):
    values = [
    {
        "receipt_item_id": receipt_item_id,
        "participant_id": participant.participant_id,
        "share_amount": float(participant.quantity * unit_price),
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
    