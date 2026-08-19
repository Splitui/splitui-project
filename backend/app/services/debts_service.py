"""Модуль с бизнес-логикой для работы с долгами участников встречи."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.db.tables.meetings import MeetingStatus
from app.repositories import debts_repository, bank_data_repository
from app.services import meetings_service, participants_service
from app.services.change_log_service import change_log, parse_debts_context


def get_debts(connection: Connection, meeting_id: int):
    """Возвращает список долгов участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: список долгов встречи.
    """
    return debts_repository.get_all_by_meeting(connection, meeting_id)


@transaction
@change_log(
    action="debts.recalculated",
    context_parser=parse_debts_context,
)
def calculate_debts(connection: Connection, meeting_uuid: UUID, session_id):
    """Подсчитывает долги участников встречи на основе чеков.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :return: пересчитанный список долгов встречи.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    _ = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
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


def get_debt_payment_info(connection: Connection, meeting_uuid: UUID, session_id: str, debt_id: int):
    """Возвращает данные для оплаты долга: сумму и реквизиты кредитора.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param debt_id: идентификатор долга.
    :param session_id: идентификатор сессии участника.
    :return: данные с суммой и реквизитами получателя.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    debt = debts_repository.get_by_id(connection, meeting["id"], debt_id)
    if debt is None:
        raise HTTPException(status_code=404, detail=f"Не найден долг с id {debt_id}")

    if debt["debtor_id"] != current_participant["id"]:
        raise HTTPException(
            status_code=403,
            detail="Получить данные для оплаты может только сам должник"
        )

    creditor = participants_service.get_participant_or_error(connection, meeting["id"], debt["creditor_id"])
    bank_data = bank_data_repository.get_bank_data_by_participant_id(connection, creditor["id"])

    if bank_data is None:
        raise HTTPException(
            status_code=409,
            detail="У получателя не указаны банковские реквизиты"
        )

    return {
        "amount": debt["amount"],
        "creditor_nickname": creditor["nickname"],
        "bank_name": bank_data["bank_name"],
        "card_number": bank_data["card_number"],
        "phone_number": bank_data["phone_number"],
    }


@transaction
def mark_debt_as_paid(connection: Connection, meeting_uuid: UUID, session_id: str, debt_id: int):
    """Отмечает долг как погашенный.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param debt_id: идентификатор долга.
    :return: обновлённые данные долга.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)

    debt = debts_repository.get_by_id(connection, meeting["id"], debt_id)
    if debt is None:
        raise HTTPException(status_code=404, detail=f"Не найден долг с id {debt_id}")

    if debt["creditor_id"] != current_participant["id"]:
        raise HTTPException(
            status_code=403,
            detail="Отметить долг оплаченным может только кредитор, получивший деньги"
        )

    if debt["is_paid"]:
        raise HTTPException(status_code=409, detail="Долг уже отмечен как оплаченный")

    if meeting["status"] != MeetingStatus.CALCULATING:
        raise HTTPException(
            status_code=409,
            detail="Отметить долг оплаченным можно только в статусе встречи 'В расчёте'"
        )

    return debts_repository.mark_as_paid(connection, debt_id)
