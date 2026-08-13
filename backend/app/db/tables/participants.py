"""Модуль структуры таблицы 'Участник'."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, func

from app.db.database import id_column, metadata

participants_table = Table(
    "participants",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("is_creator", Boolean, nullable=False, server_default="0"),
    Column("nickname", String(50), nullable=False),
    Column("created_at", DateTime, nullable=False, server_default=func.now())
)
