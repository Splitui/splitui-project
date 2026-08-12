"""Модуль с запросами к базе данных для работы с позициями чека."""

from sqlalchemy import bindparam, text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        receipt_id: int,
        title: str,
        quantity: int,
        unit_price: float,
):
    """Создаёт новую позицию в чеке.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param title: наименование позиции.
    :param quantity: количество единиц позиции.
    :param unit_price: цена за единицу.
    :return: данные созданной позиции.
    """
    result = connection.execute(
        text("""
             INSERT INTO receipt_items (receipt_id, title,
                                        quantity, unit_price)
             VALUES (:receipt_id, :title, :quantity, :unit_price) RETURNING *
             """),
        {
            "receipt_id": receipt_id,
            "title": title,
            "quantity": int(quantity),
            "unit_price": float(unit_price),
        },
    )
    return result.mappings().one()


def get_all_by_receipt_id(
        connection: Connection,
        receipt_id: int,
        num_limit: int,
        num_offset: int
):
    """Возвращает позиции указанного чека.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param num_limit: максимальное количество позиций в ответе.
    :param num_offset: смещение относительно начала списка позиций.
    :return: список данных позиций чека.
    """
    result = connection.execute(
        text(
            """
            SELECT ri.*
            FROM receipt_items ri
            WHERE ri.receipt_id = :receipt_id
            ORDER BY ri.id LIMIT :num_limit
            OFFSET :num_offset
            """
        ),
        {
            "receipt_id": receipt_id,
            "num_limit": num_limit,
            "num_offset": num_offset
        }
    )

    return result.mappings().all()

def get_all(
        connection: Connection,
        receipt_id: int,
):
    result = connection.execute(
            text(
                """
                SELECT ri.*
                FROM receipt_items ri
                WHERE ri.receipt_id = :receipt_id
                ORDER BY ri.id
                """
            ),
            {
                "receipt_id": receipt_id,
            }
        )
    
    return result.mappings().all()


def get_items_info(
        connection: Connection,
        items_id: int,
    ):

    result = connection.execute(
        text(
            """
            SELECT ri.*
            FROM receipt_items ri
            WHERE ri.id = :items_id
            """
        ),
        {
            "items_id": items_id,
        }
    )

    return result.mappings().one()

def update(
    connection: Connection,
    receipt_id: int,
    item_id: int,
    title: str,
    quantity: int,
    unit_price: float,
):
    result = connection.execute(
        text("""
            UPDATE receipt_items
            SET title = :title,
                quantity = :quantity,
                unit_price = :unit_price
            WHERE id = :item_id
              AND receipt_id = :receipt_id
            RETURNING *
        """),
        {
            "receipt_id": receipt_id,
            "item_id": item_id,
            "title": title,
            "quantity": quantity,
            "unit_price": float(unit_price),
        },
    )

    return result.mappings().one_or_none()


def delete_by_ids(
    connection: Connection,
    receipt_id: int,
    item_ids: list[int],
):
    if not item_ids:
        return []

    connection.execute(
        text("""
        DELETE FROM receipt_item_participants
        WHERE receipt_item_id IN :item_ids
        """).bindparams(bindparam(
            "item_ids",
            expanding=True,)
        ),
        {
            "item_ids": item_ids,
        },
    )

    result = connection.execute(
        text("""
        DELETE FROM receipt_items
        WHERE receipt_id = :receipt_id
          AND id IN :item_ids
        RETURNING id
        """).bindparams(bindparam(
            "item_ids",
            expanding=True,
        )
    ),
        {
            "receipt_id": receipt_id,
            "item_ids": item_ids,
        },
    )

    return result.scalars().all()