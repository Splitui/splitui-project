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

def get_items_by_participant(
    connection: Connection,
    meeting_id: int,
    participant_id: int,
):

    """
    Возвращает позиции встречи, связанные с участником.

    Выбирает только те позиции чеков, которые принадлежат указанной
    встрече и в распределении которых участвует указанный участник.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param participant_id: идентификатор участника.
    :return: список позиций с идентификатором, ценой за единицу и количеством.
    """
    
    result = connection.execute(
        text("""
            SELECT
                ri.id AS receipt_item_id,
                ri.unit_price,
                ri.quantity
            FROM receipt_item_participants rip
            JOIN receipt_items ri
                ON ri.id = rip.receipt_item_id
            JOIN receipts r
                ON r.id = ri.receipt_id
            WHERE rip.participant_id = :participant_id
              AND r.meeting_id = :meeting_id
            ORDER BY ri.id
        """),
        {
            "meeting_id": meeting_id,
            "participant_id": participant_id,
        },
    )

    return result.mappings().all()

def get_participant_ids_except(
    connection: Connection,
    receipt_item_id: int,
    excluded_participant_id: int,
):

    """
    Обновляет распределённые суммы участников позиций.

    Выполняет множественное обновление связей по переданному списку.
    Каждый элемент списка должен содержать идентификатор позиции,
    идентификатор участника и новую сумму его доли.

    :param connection: соединение с базой данных.
    :param values: список данных для обновления связей. Каждый словарь содержит receipt_item_id, participant_id и share_amount.
    :return: None.
    """
    
    result = connection.execute(
        text("""
            SELECT participant_id
            FROM receipt_item_participants
            WHERE receipt_item_id = :receipt_item_id
              AND participant_id != :excluded_participant_id
            ORDER BY participant_id
        """),
        {
            "receipt_item_id": receipt_item_id,
            "excluded_participant_id": excluded_participant_id,
        },
    )

    return result.scalars().all()

def delete_participant_link(
    connection: Connection,
    receipt_item_id: int,
    participant_id: int,
):
    connection.execute(
        text("""
            DELETE FROM receipt_item_participants
            WHERE receipt_item_id = :receipt_item_id
              AND participant_id = :participant_id
        """),
        {
            "receipt_item_id": receipt_item_id,
            "participant_id": participant_id,
        },
    )

def update_share_amounts(
    connection: Connection,
    values: list[dict],
):

    """
    Обновляет распределённые суммы участников позиций.

    Выполняет множественное обновление связей по переданному списку.
    Каждый элемент списка должен содержать идентификатор позиции,
    идентификатор участника и новую сумму его доли.

    :param connection: соединение с базой данных.
    :param values: список данных для обновления связей. Каждый словарь содержит receipt_item_id, participant_id и share_amount.
    :return: None.
    """
    
    if not values:
        return

    connection.execute(
        text("""
            UPDATE receipt_item_participants
            SET share_amount = :share_amount
            WHERE receipt_item_id = :receipt_item_id
              AND participant_id = :participant_id
        """),
        values,
    )