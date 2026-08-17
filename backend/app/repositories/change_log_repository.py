import json

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
    connection: Connection,
    meeting_id: int,
    participant_id: int | None,
    action: str,
    value: dict,
):
    result = connection.execute(
        text("""
            INSERT INTO change_log (
                meeting_id,
                participant_id,
                action,
                value
            )
            VALUES (
                :meeting_id,
                :participant_id,
                :action,
                :value
            )
            RETURNING *
        """),
        {
            "meeting_id": meeting_id,
            "participant_id": participant_id,
            "action": action,
            "value": json.dumps(value,ensure_ascii=False, default=str),
        },
    )

    return result.mappings().one()


def get_all_by_meeting_id(
    connection: Connection,
    meeting_id: int,
    num_limit: int,
    num_offset: int,
):
    result = connection.execute(
        text("""
            SELECT
                cl.id,
                cl.action,
                cl.value,
                cl.participant_id,
                cl.created_at
            FROM change_log cl
            WHERE cl.meeting_id = :meeting_id
            ORDER BY cl.id DESC
            LIMIT :num_limit
            OFFSET :num_offset
        """),
        {
            "meeting_id": meeting_id,
            "num_limit": num_limit,
            "num_offset": num_offset,
        },
    )

    changes = []

    for row in result.mappings().all():
        change = dict(row)
        change["value"] = json.loads(change["value"])
        changes.append(change)

    return changes