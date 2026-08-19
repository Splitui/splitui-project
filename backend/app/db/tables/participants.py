"""Модуль структуры таблицы 'Участник'."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, func, UniqueConstraint

from app.db.database import id_column, metadata

participants_table = Table(
    "participants",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("is_creator", Boolean, nullable=False, server_default="0"),
    Column("nickname", String(50), nullable=False),
    Column("session_id_hash", String(64), nullable=False, unique=True),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
    UniqueConstraint("meeting_id", "nickname", name="unique_participants_meeting_nickname")
)
