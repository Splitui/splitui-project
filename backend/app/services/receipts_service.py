"""Модуль с бизнес-логикой для работы с чеками."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import (
    items_participants_repository,
    meetings_repository,
    participants_repository,
    receipt_items_repository,
    receipts_repository,
)
from app.schemas.receipts import FullReceiptParticipantCreate, FullReceiptCreate
from app.services import meetings_service, participants_service
from app.services.meetings_service import get_meeting_or_error
from app.services.receipt_items_service import sync_receipt_items
from app.services.change_log_service import (
    change_log,
    parse_deleted_receipt_context,
    parse_receipt_action,
    parse_receipt_context,
)
from app.services.receipt_validators import check_missing_and_return_error, validate_receipt_belongs_to_meeting, validate_unique


def get_receipts_from_meeting(
        connection: Connection,
        meeting_id: int,
        num_limit: int,
        num_offset: int
):
    """
    Возвращает данные чеков указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param num_limit: максимальное количество чеков в ответе.
    :param num_offset: смещение относительно начала списка чеков.
    :return: список данных чеков.
    """
    return receipts_repository.get_all_by_meeting_uuid(connection, meeting_id, num_limit, num_offset)

def get_receipt_full(
        connection: Connection,
        meeting_id: int,
        receipt_id: int,
        num_limit: int,
        num_offset: int
):
    """
    Возвращает чек с позициями, участниками и долгами.

    Проверяет существование встречи и принадлежность чека указанной
    встрече. Для каждой позиции возвращает связанных с ней участников
    и распределённые суммы. Также рассчитывает общий долг каждого
    участника по всем позициям чека, исключая плательщика.

    Ограничение и смещение применяются только к списку позиций.
    Долги рассчитываются по всем позициям чека независимо от пагинации.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param receipt_id: идентификатор чека.
    :param num_limit: максимальное количество позиций в ответе.
    :param num_offset: смещение относительно начала списка позиций.
    :return: данные чека, позиции с участниками и долги по чеку.
    """
    receipt = receipts_repository.get_by_id(connection, receipt_id)
    if receipt is None:
        raise HTTPException(
            status_code=404,
            detail="Чек не найден",
        )

    if meeting_id != receipt["meeting_id"]:
        raise HTTPException(
            status_code=400,
            detail="Чек не относится ко встрече",
        )

    items = receipt_items_repository.get_all_by_receipt_id(
        connection,
        receipt_id,
        num_limit,
        num_offset,
    )

    result_items = []

    for item in items:
        participants = (
            items_participants_repository.get_all_by_item_id(
                connection,
                item["id"],
            )
        )

        result_items.append({
            **item,
            "participants": participants,
        })


    participant_amounts = (
        items_participants_repository.get_amounts_by_receipt_id(
            connection,
            receipt_id,
            receipt["payer_id"]
        )
    )

    return {
        **receipt,
        "items": result_items,
        "participant_amounts": participant_amounts
    }

@transaction
@change_log(
    action=parse_receipt_action,
    context_parser=parse_receipt_context,
)
def create_or_update_receipt_in_meeting(
        connection: Connection,
        meeting_uuid: UUID,
        session_id: str,
        data: FullReceiptCreate
):
    """
    Создаёт или обновляет чек указанной встречи.

    Проверяет существование встречи, права участника на изменение чека
    и принадлежность переданных участников встрече. Итоговая сумма
    рассчитывается по позициям либо берётся из total_amount, если позиции
    отсутствуют.

    При создании сохраняет новый чек. При обновлении проверяет, что чек
    принадлежит указанной встрече, и обновляет его данные. После этого
    синхронизирует позиции, связи с участниками и их доли. Если позиции
    отсутствуют, создаётся одна фиктивная позиция на полную сумму чека.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи, в которой находится чек.
    :param session_id: идентификатор сессии участника.
    :param data: данные для создания или обновления чека.
    :return: данные созданного или обновлённого чека и его позиций.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    if not (current_participant["is_creator"] or current_participant["id"] == data.payer_id):
        raise HTTPException(
            status_code=403,
            detail=(
                "Создавать или редактировать чек может только плательщик или создатель встречи"
            ),
        )

    participants = participants_repository.get_all(connection, meeting["id"])

    if data.participants:
        split_participants = data.participants
    else:
        split_participants = [
            FullReceiptParticipantCreate(
                participant_id=participant["id"],
            )
            for participant in participants
        ]

    meeting_participants = {
        participant["id"]
        for participant in participants
    }

    receipt_participant_ids = [
    participant.participant_id
    for participant in data.participants
    ]

    validate_unique(
        receipt_participant_ids,
        data.title,
        (
            "Один участник не может быть указан несколько раз в одном чеке"
        ),
    )

    data_participants = {
        data.payer_id,
        *(
            participant.participant_id
            for participant in data.participants
        ),
    }

    check_missing_and_return_error(data_participants,meeting_participants,
                                   "Некоторые участники не относятся к указанной встрече")

    if data.items is not None:
        for item in data.items:
                participant_ids = [
                    participant.participant_id
                    for participant in item.participants
                ]
                validate_unique(participant_ids,item.title,
                    "Один участник не может быть указан несколько раз в одной позиции")

                check_missing_and_return_error(
                    set(participant_ids), meeting_participants,
                    "Некоторые участники позиции не относятся к указанной встрече" )

    total_amount = data.total_amount
    
    if data.items is not None:
        total_amount = sum(
            item.quantity * item.unit_price
            for item in data.items
        )

    if total_amount is None:
        raise HTTPException(
            status_code=400,
            detail="Нет информации о стоимости",
        )

    if data.id is None:
        receipt = receipts_repository.create(
            connection,
            meeting["id"],
            data.payer_id,
            data.title,
            data.purchase_date,
            data.category,
            data.comment,
            data.image_url,
            data.is_confirmed,
            total_amount
        )

        existing_items = set()

    else:
        existing_receipt = (
            receipts_repository.get_by_id(
                connection,
                data.id,
            )
        )

        validate_receipt_belongs_to_meeting(existing_receipt,meeting["id"])

        receipt = receipts_repository.update(
            connection=connection,
            receipt_id=data.id,
            payer_id=data.payer_id,
            title=data.title,
            purchase_date=data.purchase_date,
            category=data.category,
            comment=data.comment,
            image_url=data.image_url,
            is_confirmed=data.is_confirmed,
            total_amount=total_amount,
        )

        items = (
            receipt_items_repository.get_all(
                connection,
                data.id,
            )
        )

        existing_items = {
            item["id"]
            for item in items
        }

    result_items = sync_receipt_items(connection,data.items,existing_items,receipt["id"],
                                total_amount,split_participants)

    participant_amounts = (
        items_participants_repository.get_amounts_by_receipt_id(
            connection,
            receipt["id"],
            data.payer_id
        )
    )

    return {
            "receipt": {
                **receipt,
                "total_amount": total_amount,
            },
            "items": result_items,
            "participant_amounts": participant_amounts,
        }


@transaction
@change_log(
    action="receipt.deleted",
    context_parser=parse_deleted_receipt_context,
)
def delete_receipt(connection: Connection, meeting_uuid: UUID, session_id: str, receipt_id: int):
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    receipt = receipts_repository.get_by_id(connection, receipt_id)
    if receipt is None or receipt["meeting_id"] != meeting["id"]:
        raise HTTPException(
            status_code=404,
            detail="Чек не найден в указанной встрече",
        )

    participant = participants_service.get_participant_or_error(connection, meeting["id"], receipt["payer_id"])
    if not (current_participant["is_creator"] or current_participant["id"] == participant["id"]):
        raise HTTPException(
            status_code=403,
            detail=(
                "Удалять чек может только плательщик или создатель встречи"
            ),
        )

    deleted_id = receipts_repository.delete(connection, receipt_id)

    return {
        "deleted_receipt_id": deleted_id,
        "meeting_id": receipt["meeting_id"],
        "title": receipt["title"],
    }
