"""Модуль структуры таблицы 'Пользователь'."""

from sqlalchemy import Table, Column, String, DateTime, func

from app.db.database import metadata, id_column

users_table = Table(
    "users",
    metadata,
    id_column(),
    Column("username", String(50), nullable=False, unique=True),
    Column("password_hash", String(255), nullable=False),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
)
