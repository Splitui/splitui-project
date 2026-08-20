"""Модуль структуры таблицы 'Сессии пользователя'."""

from sqlalchemy import Table, Column, Integer, ForeignKey, String, DateTime, func

from app.db.database import metadata, id_column

user_sessions_table = Table(
    "user_sessions",
    metadata,
    id_column(),
    Column("user_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("token_hash", String(64), nullable=False, unique=True),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
)