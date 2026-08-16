"""Модуль с переиспользуемыми валидаторами и типами."""
import re
from typing import Annotated, Any

from pydantic import AfterValidator, Field, BeforeValidator


def _strip_and_check_not_empty(value: str) -> str:
    """Убирает пробелы по краям строки и проверяет, что она не пустая.

    :param value: исходная строка.
    :return: строка без пробелов по краям.
    """
    value = value.strip()
    if not value:
        raise ValueError("Поле не может состоять только из пробелов")
    return value


NonEmptyStr = Annotated[str, AfterValidator(_strip_and_check_not_empty)]


def _validate_nickname(value: str) -> str | None:
    if not re.compile(r"[A-Za-zА-Яа-яЁё0-9_-]+").fullmatch(value):
        raise ValueError(
            "Никнейм может содержать только буквы, цифры, пробелы, "
            "дефисы, точки и нижние подчёркивания"
        )

    return value


Nickname = Annotated[
    NonEmptyStr,
    Field(max_length=50),
    AfterValidator(_validate_nickname),
]


def _remove_separators(value: Any) -> str | None:
    if value is None:
        return None

    if not isinstance(value, str):
        return value

    value = re.sub(r"[\s()-]", "", value)
    return value or None


CardNumber = Annotated[
    str | None,
    BeforeValidator(_remove_separators),
    Field(min_length=16, max_length=25),
]

PhoneNumber = Annotated[
    str | None,
    BeforeValidator(_remove_separators),
    Field(min_length=10, max_length=15),
]
