"""Модуль с запросами к базе данных для работы с встречами."""

import uuid
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        receipt_item_id: int,
        participant_id: int,
        share_amount: int,
):
    result = connection.execute(
        text("""
             INSERT INTO receipt_item_participants (receipt_item_id, participant_id, share_amount)
             VALUES (:receipt_item_id, :participant_id, :share_amount) RETURNING *
             """),
        {
            "receipt_item_id": receipt_item_id,
            "participant_id": participant_id,
            "share_amount": float(share_amount),
        },
    )

    return result.mappings().one()

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

    return result.scalar_one()\

    