from datetime import datetime

from sqlalchemy import ForeignKey, Numeric, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Debt(Base):
    __tablename__ = "debts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    debtor_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        nullable=False,
    )

    creditor_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
