from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ChangeLog(Base):

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        nullable=False,
    )

    participant_id: Mapped[int | None] = mapped_column(
        ForeignKey("participants.id"),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
