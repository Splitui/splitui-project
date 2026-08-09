"""
Модуль структуры таблицы 'Встреча'.
"""

from enum import StrEnum

from sqlalchemy import DateTime, String, func, Uuid, Boolean, Enum, text, Table, MetaData, Column, Integer

from app.db.database import metadata, id_column


class MeetingStatus(StrEnum):
    """Перечисление возможных статусов встречи."""

    ACTIVE = "Активная"
    CALCULATING = "В расчете"
    FINISHED = "Завершена"
    EDITING = "Корректировка"


meetings_table = Table(
    "meetings",
    metadata,
    id_column(),
    Column("uuid", Uuid, nullable=False, unique=True),
    Column("title", String(150), nullable=False),
    Column("is_public", Boolean, nullable=False, server_default=text("0")),
    Column(
        "status",
        Enum(MeetingStatus, name="meeting_status_enum"),
        nullable=False,
        server_default=MeetingStatus.ACTIVE.value
    ),
    Column("start_date", DateTime, nullable=False, server_default=func.now()),
    Column("end_date", DateTime, nullable=True)
)
