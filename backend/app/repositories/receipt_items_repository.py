from sqlalchemy.engine import Connection
from sqlalchemy import text

def create(
    connection: Connection,
    receipt_id: int,
    title: str,
    quantity: int,
    unit_price: float,
):
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

def get_all_by_receipt_id(connection: Connection, num_limit: int,
                          num_offset: int, receipt_id: int):
    result = connection.execute(
        text(
            """
            SELECT ri.*
            FROM receipt_items ri
                     JOIN receipts r
                          ON ri.receipt_id = r.id
            WHERE r.id = :receipt_id
            ORDER BY ri.id
            LIMIT :num_limit OFFSET :num_offset
            """
        ),
        {
            "receipt_id": receipt_id,
            "num_limit": num_limit,
            "num_offset": num_offset
        }
    )

    return result.mappings().all()