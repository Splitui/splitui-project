from sqlalchemy.engine import Connection
from sqlalchemy import text

def create(
        connection: Connection,
        meeting_id: int,
        payer_id: int,
        title: str,
        category: str,
        comment: str,
        image_url: str,
        is_confirmed: bool,
):
    result = connection.execute(
        text("""
             INSERT INTO receipts (meeting_id, payer_id, title,
             category, comment, image_url, is_confirmed)
             VALUES (:meeting_id, :payer_id, :title,
             :category, :comment, :image_url, :is_confirmed) RETURNING *
             """),
        {
            "meeting_id": meeting_id,
            "payer_id": payer_id,
            "title": title,
            "category": category,
            "comment": comment,
            "image_url": image_url,
            "is_confirmed": is_confirmed,
        },
    )
    return result.mappings().one()

def get_all(connection: Connection):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM receipts
            ORDER BY id
            """
        )
    )

    return result.mappings().all()


def get_all_by_meeting_uuid(connection: Connection, meeting_uuid):
    result = connection.execute(
        text(
            """
            SELECT r.*
            FROM receipts r
                     JOIN meetings m
                          ON m.id = r.meeting_id
            WHERE m.uuid = :meeting_uuid
            ORDER BY r.id
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid)
        }
    )

    return result.mappings().all()