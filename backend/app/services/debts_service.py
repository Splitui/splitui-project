"""Модуль с бизнес-логикой для работы с долгами участников встречи."""

from decimal import Decimal
from uuid import UUID

from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import debts_repository
from app.services import meetings_service
from app.services.change_log_service import change_log, parse_debts_context


def get_debts(connection: Connection, meeting_uuid: UUID):
    """Возвращает список долгов участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: список долгов встречи.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    return debts_repository.get_all_by_meeting(connection, meeting["id"])


@transaction
@change_log(
    action="debts.recalculated",
    context_parser=parse_debts_context,
)
def calculate_debts(connection: Connection, meeting_uuid: UUID):
    """Подсчитывает долги участников встречи на основе чеков.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: пересчитанный список долгов встречи.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    balances = debts_repository.get_balances_by_meeting(connection, meeting["id"])
    debts = get_debts_by_balances(balances)
    if not debts:
        return []
    debts_repository.calculate_for_meeting(connection, meeting["id"], debts)
    return debts_repository.get_all_by_meeting(connection, meeting["id"])


def get_debts_by_balances(balances: list[dict]) -> list[dict]:
    """Формирует набор переводов для погашения долгов участников.

    :param balances: список балансов участников.
    :return: список долгов.
    """
    creditors = sorted(
        (
            {"participant_id": b["participant_id"], "amount": Decimal(b["balance"])}
            for b in balances
            if Decimal(b["balance"]) > 0
        ),
        key=lambda x: x["amount"],
        reverse=True,
    )
    debtors = sorted(
        (
            {"participant_id": b["participant_id"], "amount": -Decimal(b["balance"])}
            for b in balances
            if Decimal(b["balance"]) < 0
        ),
        key=lambda x: x["amount"],
        reverse=True,
    )

    debts = []
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        creditor, debtor = creditors[i], debtors[j]
        amount = min(creditor["amount"], debtor["amount"])

        debts.append({
            "debtor_id": debtor["participant_id"],
            "creditor_id": creditor["participant_id"],
            "amount": amount,
        })

        creditor["amount"] -= amount
        debtor["amount"] -= amount

        if creditor["amount"] == 0:
            i += 1
        if debtor["amount"] == 0:
            j += 1

    return debts
