from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func, Integer, Computed
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    receipt_id: Mapped[int] = mapped_column(
        ForeignKey("receipts.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        default=Decimal("0.00"),
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        Computed("unit_price * quantity"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
