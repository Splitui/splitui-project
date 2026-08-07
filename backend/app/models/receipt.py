from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, func, Boolean, ForeignKey, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id"),
        nullable=False,
    )

    payer_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        server_default=text("0.00"),
    )

    cashback_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        server_default=text("0.00"),
    )

    purchase_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        server_default=func.now(),
    )

    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    image_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
        onupdate=func.now(),
    )
