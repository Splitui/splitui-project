"""Модуль структуры таблицы 'Журнал изменений'."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text, func

from app.db.database import id_column, metadata

change_log_table = Table(
    "change_log",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("participant_id", Integer, ForeignKey("participants.id", ), nullable=True),
    Column("action", String(20), nullable=False),
    Column("value", Text, nullable=True),
    Column("created_at", DateTime, nullable=False, server_default=func.now())
)
