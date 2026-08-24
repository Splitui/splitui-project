from sqlalchemy import text
from sqlalchemy.engine import Connection


def get_summary(
    connection: Connection,
    meeting_id: int,
) -> dict:
    result = connection.execute(
        text("""
            SELECT
                COALESCE(SUM(r.total_amount), 0) AS total_expenses,
                COUNT(r.id) AS checks_count
            FROM receipts r
            WHERE r.meeting_id = :meeting_id
        """),
        {
            "meeting_id": meeting_id,
        },
    )

    return dict(result.mappings().one())

def get_participant_balances(
    connection: Connection,
    meeting_id: int,
) -> list[dict]:
    result = connection.execute(
        text("""
            SELECT
                p.id AS participant_id,
                p.nickname AS name,
                COALESCE(paid.total, 0) AS paid,
                COALESCE(shares.total, 0) AS share,
                COALESCE(paid.total, 0) - COALESCE(shares.total, 0) AS balance
            FROM participants p

            LEFT JOIN (
                SELECT
                    payer_id,
                    SUM(total_amount) AS total
                FROM receipts
                WHERE meeting_id = :meeting_id
                GROUP BY payer_id
            ) paid
                ON paid.payer_id = p.id

            LEFT JOIN (
                SELECT
                    rip.participant_id,
                    SUM(rip.share_amount) AS total
                FROM receipt_item_participants rip
                JOIN receipt_items ri
                    ON ri.id = rip.receipt_item_id
                JOIN receipts r
                    ON r.id = ri.receipt_id
                WHERE r.meeting_id = :meeting_id
                GROUP BY rip.participant_id
            ) shares
                ON shares.participant_id = p.id

            WHERE p.meeting_id = :meeting_id
            ORDER BY p.id
        """),
        {
            "meeting_id": meeting_id,
        },
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]


def get_expenses(
    connection: Connection,
    meeting_id: int,
) -> list[dict]:
    result = connection.execute(
        text("""
            SELECT
                r.id,
                r.purchase_date,
                r.title,
                payer.nickname AS payer,
                cc.name AS category,
                r.total_amount AS amount,
                r.is_confirmed AS confirmed
            FROM receipts r
            JOIN participants payer
                ON payer.id = r.payer_id
            LEFT JOIN cashback_categories cc
                ON CAST(cc.id AS TEXT) = r.category
            WHERE r.meeting_id = :meeting_id
            ORDER BY r.purchase_date, r.id
        """),
        {
            "meeting_id": meeting_id,
        },
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]
