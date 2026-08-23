from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy.engine import Connection

from app.repositories import (
    debts_repository,
    report_repository,
)
from app.services import meetings_service
from app.utils.report.generator import generate_report
from app.utils.report.schemas import ReportData


def format_date(value) -> str:
    if value is None:
        return "Не указано"

    if isinstance(value, str):
        value = datetime.fromisoformat(value)

    return value.strftime("%d.%m.%Y")


def build_report_data(
    connection: Connection,
    meeting_uuid: UUID,
) -> ReportData:
    meeting = meetings_service.get_meeting_or_error(
        connection,
        meeting_uuid,
    )

    meeting_id = meeting["id"]

    summary = report_repository.get_summary(
        connection,
        meeting_id,
    )
    participants = report_repository.get_participant_balances(
        connection,
        meeting_id,
    )
    expenses = report_repository.get_expenses(
        connection,
        meeting_id,
    )
    debts = debts_repository.get_all_by_meeting(
        connection,
        meeting_id,
    )

    participants_count = len(participants)
    total_expenses = float(summary["total_expenses"])

    average_expense = (
        total_expenses / participants_count
        if participants_count
        else 0
    )

    start_date = format_date(meeting["start_date"])
    end_date = (
        format_date(meeting["end_date"])
        if meeting["end_date"] is not None
        else "по настоящее время"
    )

    return {
        "meeting": {
            "name": meeting["title"],
            "period": (
                f"{start_date} — {end_date}"
            ),
            "participants_count": participants_count,
            "meeting_id": str(meeting["uuid"]),
        },
        "report": {
            "created_at": datetime.now(UTC).strftime(
                "%d.%m.%Y %H:%M"
            ),
            "report_id": str(uuid4()),
        },
        "summary": {
            "total_expenses": total_expenses,
            "average_expense": average_expense,
            "checks_count": summary["checks_count"],
            "status": meeting["status"],
        },
        "warnings":  [],
        "transfers": [
            {
                "from": debt["debtor_nickname"],
                "to": debt["creditor_nickname"],
                "amount": float(debt["amount"]),
            }
            for debt in debts
        ],
        "participants": [
            {
                "name": participant["name"],
                "paid": float(participant["paid"]),
                "share": float(participant["share"]),
                "balance": float(participant["balance"]),
            }
            for participant in participants
        ],
        "expenses": [
            {
                "date": format_date(expense["purchase_date"]),
                "name": expense["title"],
                "payer": expense["payer"],
                "category": expense["category"] or "Без категории",
                "amount": float(expense["amount"]),
                "confirmed": True,
            }
            for expense in expenses
        ],
    }

def create_meeting_report(
    connection: Connection,
    meeting_uuid: UUID,
    output_path: str,
):
    """Собирает данные встречи и формирует PDF-отчёт."""

    report_data = build_report_data(
        connection,
        meeting_uuid,
    )

    return generate_report(
        data=report_data,
        filename=output_path,
    )