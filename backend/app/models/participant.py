from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, Boolean, String, func, DateTime

from app.db.base import Base


class Participants(Base):

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        nullable=False,
    )

    is_creator: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    nickname: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    bank_data_id: Mapped[int] = mapped_column(
        ForeignKey("bank_data.id"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now()
    )
