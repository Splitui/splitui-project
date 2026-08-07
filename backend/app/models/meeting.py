from enum import StrEnum
from datetime import datetime
import uuid as uuid_module

from sqlalchemy import DateTime, String, func, Uuid, Boolean, Enum, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MeetingStatus(StrEnum):
    ACTIVE = "Активная"
    CALCULATING = "В расчете"
    FINISHED = "Завершена"
    EDITING = "Корректировка"


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    uuid: Mapped[uuid_module.UUID] = mapped_column(
        Uuid,
        nullable=False,
        unique=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    is_public: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("0")
    )

    status: Mapped[MeetingStatus] = mapped_column(
        Enum(
            MeetingStatus,
            name="meeting_status_enum",
        ),
        nullable=False,
        server_default=MeetingStatus.ACTIVE,
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
