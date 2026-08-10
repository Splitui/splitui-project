from sqlalchemy.engine import Connection
from sqlalchemy import text


def create(
        connection: Connection,
        meeting_id: int,
        nickname: str,
        is_creator: bool
):
    result = connection.execute(
        text("""
             INSERT INTO participants (meeting_id, nickname, is_creator)
             VALUES (:meeting_id, :nickname, :is_creator) RETURNING id, meeting_id, nickname, is_creator
             """),
        {
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator,
        },
    )
    return result.mappings().one()


def get_all(connection: Connection):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM participants
            ORDER BY id
            """
        )
    )

    return result.mappings().all()


def get_all_by_meeting_uuid(connection: Connection,num_limit: int, num_offset: int, meeting_uuid):
    result = connection.execute(
        text(
            """
            SELECT p.id,
                   p.nickname,
                   p.is_creator
            FROM participants p
                     JOIN meetings m
                          ON m.id = p.meeting_id
            WHERE m.uuid = :meeting_uuid
            ORDER BY p.id
            LIMIT :num_limit OFFSET :num_offset
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid),
            "num_limit": str(num_limit),
            "num_offset": str(num_offset),
        }
    )
    return result.mappings().all()
