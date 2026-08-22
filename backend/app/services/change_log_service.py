from functools import wraps
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection
from inspect import signature
from typing import Mapping

from pydantic import BaseModel

from app.repositories import (
    change_log_repository,
    meetings_repository,
    participants_repository,
)


ACTION_MESSAGES = {
    "meeting.created": 'Создана встреча «{title}»',
    "meeting.updated": 'Изменена встреча «{title}»',
    "participant.created": '{participant}: присоединение к встрече',
    "participant.updated": '{participant}: данные участника изменены',
    "receipt.created": '{participant}: добавлен чек «{title}»',
    "receipt.updated": '{participant}: изменён чек «{title}»',
    "receipt.deleted": '{participant}: удалён чек «{title}»',
    "bank_data.updated": '{participant}: банковские реквизиты изменены',
    "debts.recalculated": "Долги встречи пересчитаны",
    "meeting.calculating": 'Встреча «{title}» переведена к расчётам',
    "meeting.finished": 'Встреча «{title}» завершена',
    "meeting.editing": 'Встреча «{title}» возвращена к редактированию',
}


def build_message(action: str, participant: str, context: dict) -> str:
    template = ACTION_MESSAGES.get(
        action,
        "{participant} выполнил действие",
    )

    return template.format(
        participant=participant,
        **context,
    )

def build_context(arguments: dict, result) -> dict:
    context = {}

    for name, value in arguments.items():
        if name == "connection":
            continue

        if isinstance(value, BaseModel):
            context.update(
                value.model_dump(mode="json")
            )
        else:
            context[name] = value

    if isinstance(result, Mapping):
        context.update(dict(result))
    else:
        context["result"] = result

    return context

def change_log(
    action,
    context_parser = None,
):

    """
    Создаёт запись в журнале после успешного изменения данных.

    Декоратор выполняет исходную функцию, определяет тип операции,
    формирует контекст и читаемое сообщение, после чего сохраняет
    изменение в таблице change_log.

    Параметр action может быть строкой с фиксированным типом операции
    либо функцией, определяющей операцию по аргументам и результату.
    Если передан context_parser, контекст формируется с его помощью.
    Иначе объединяются аргументы и результат исходной функции.

    :param action: тип операции или функция для его определения.
    :param context_parser: функция формирования контекста изменения.
    :return: декоратор функции, изменяющей данные.
    """
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            bound = signature(func).bind(*args, **kwargs)
            bound.apply_defaults()
            arguments = bound.arguments

            result = func(*args, **kwargs)

            current_action = (
                action(arguments, result)
                if callable(action)
                else action
            )

            context = (
                context_parser(arguments, result)
                if context_parser
                else build_context(arguments,result)
            )

            connection = arguments["connection"]

            meeting_id = context.get("meeting_id")

            if meeting_id is None:
                meeting_uuid = arguments.get("meeting_uuid")
                if meeting_uuid is not None:
                    meeting = meetings_repository.get_by_uuid(
                        connection,
                        meeting_uuid,
                    )
                    meeting_id = meeting["id"]
                else:
                    meeting_id = result["id"]

            participant_id = context.get("participant_id")

            participant = "Неизвестный участник"

            if participant_id is not None:
                participant = participants_repository.get_by_id(
                    connection,
                    meeting_id,
                    participant_id,
                )

                if participant is not None:
                    participant = participant["nickname"]

            message = build_message(
                action=current_action,
                participant=participant,
                context=context,
            )

            change_log_repository.create(
                connection=connection,
                meeting_id=meeting_id,
                participant_id=participant_id,
                action=current_action,
                value={
                    "message": message,
                    "context": context,
                },
            )

            return result

        return wrapper

    return decorator

def get_changes_from_meeting(
    connection: Connection,
    meeting_uuid: UUID,
    num_limit: int,
    num_offset: int,
):
    """Возвращает список изменений указанной встречи.

    Проверяет существование встречи и получает записи журнала
    в порядке от новых к старым с учётом ограничения и смещения.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param num_limit: максимальное количество изменений в ответе.
    :param num_offset: смещение от начала списка изменений.
    :return: список изменений встречи.
    """
    meeting = meetings_repository.get_by_uuid(
        connection,
        meeting_uuid,
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": (
                    f"Не найдена встреча с uuid {meeting_uuid}"
                ),
            },
        )

    return change_log_repository.get_all_by_meeting_id(
        connection=connection,
        meeting_id=meeting["id"],
        num_limit=num_limit,
        num_offset=num_offset,
    )

def parse_receipt_action(arguments: dict, result: dict) -> str:
    if arguments["data"].id is None:
        return "receipt.created"

    return "receipt.updated"

def get_participant_id_from_session(arguments: dict) -> int | None:
    session_id = arguments.get("session_id")

    if session_id is None:
        return None

    participant = participants_repository.get_by_session_id(
        arguments["connection"],
        session_id,
    )

    if participant is None:
        return None

    return participant["id"]

def parse_receipt_context(arguments: dict, result: dict) -> dict:
    receipt = result["receipt"]

    return {
        "meeting_id": receipt["meeting_id"],
        "entity_id": receipt["id"],
        "participant_id": get_participant_id_from_session(
            arguments,
        ),
        "title": receipt["title"],
    }


def parse_deleted_receipt_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["meeting_id"],
        "entity_id": result["deleted_receipt_id"],
        "participant_id": get_participant_id_from_session(
            arguments,
        ),
        "title": result["title"],
    }

def parse_created_meeting_context(
    arguments: dict,
    result: dict,
) -> dict:
    creator = result["meeting_creator"]

    return {
        "meeting_id": result["id"],
        "entity_id": result["id"],
        "participant_id": creator["id"],
        "title": result["title"],
    }

def parse_updated_meeting_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["id"],
        "entity_id": result["id"],
        "title": result["title"],
    }

def parse_created_participant_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["meeting_id"],
        "entity_id": result["id"],
        "participant_id": result["id"],
        "nickname": result["nickname"],
    }

def parse_updated_participant_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["meeting_id"],
        "entity_id": result["id"],
        "participant_id": result["id"],
        "nickname": result["nickname"],
    }

def parse_bank_data_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "participant_id": result["participant_id"],
    }

def parse_debts_context(
    arguments: dict,
    result: list,
) -> dict:
    return {
        "debts_count": len(result),
    }

def parse_meeting_status_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["id"],
        "entity_id": result["id"],
        "title": result["title"],
        "status": result["status"],
    }