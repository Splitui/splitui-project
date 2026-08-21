"""Модуль со схемами для регистрации и авторизации пользователей."""

import re

from pydantic import BaseModel, Field, field_validator


class UserRegister(BaseModel):
    """Схема для регистрации пользователя.

    :ivar username: логин пользователя.
    :ivar password: пароль пользователя.
    """
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username_format(cls, username: str) -> str:
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+", username):
            raise ValueError(
                "Логин может содержать только латинские буквы, цифры, точку, дефис и нижнее подчёркивание"
            )
        return username

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, password: str) -> str:
        if not re.search(r"[a-zA-Zа-яА-Я]", password):
            raise ValueError("Пароль должен содержать хотя бы одну букву")
        if not re.search(r"\d", password):
            raise ValueError("Пароль должен содержать хотя бы одну цифру")
        return password


class UserLogin(BaseModel):
    """Схема для входа в аккаунт.

    :ivar username: логин пользователя.
    :ivar password: пароль пользователя.
    """
    username: str
    password: str
