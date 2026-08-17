from functools import wraps
from inspect import signature
from typing import Callable, Mapping

from pydantic import BaseModel

from app.repositories import (
    change_log_repository,
    meetings_repository,
    participants_repository,
)


ACTION_MESSAGES = {
    "meeting.created": '{participant} создал встречу «{title}»',
    "meeting.updated": '{participant} изменил встречу «{title}»',
    "participant.created": '{participant} присоединился к встрече',
    "participant.updated": '{participant} изменил данные участника',
    "receipt.created": '{participant} добавил чек «{title}»',
    "receipt.updated": '{participant} изменил чек «{title}»',
    "receipt.deleted": '{participant} удалил чек «{title}»',
    "bank_data.updated": '{participant} изменил банковские реквизиты',
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

            participant_id = arguments.get("participant_id")

            if participant_id is None:
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


def parse_receipt_action(arguments: dict, result: dict) -> str:
    if arguments["data"].id is None:
        return "receipt.created"

    return "receipt.updated"


def parse_receipt_context(arguments: dict, result: dict) -> dict:
    receipt = result["receipt"]

    return {
        "meeting_id": receipt["meeting_id"],
        "entity_id": receipt["id"],
        "title": receipt["title"],
    }


def parse_deleted_receipt_context(
    arguments: dict,
    result: dict,
) -> dict:
    return {
        "meeting_id": result["meeting_id"],
        "entity_id": result["deleted_receipt_id"],
        "title": result["title"],
    }