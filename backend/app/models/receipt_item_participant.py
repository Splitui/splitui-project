from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReceiptItemParticipant(Base):
    __tablename__ = "receipt_item_participants"

    receipt_item_id: Mapped[int] = mapped_column(
        ForeignKey("receipt_items.id"),
        primary_key=True,
    )

    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        primary_key=True,
    )


    share_amount: Mapped[Decimal] = mapped_column(
        Numeric(10,2),
        nullable=False,
    )


    participant: Mapped["Participant"] = relationship(
        back_populates="receipt_item_participants",
    )

    receipt_item: Mapped["ReceiptItem"] = relationship(
        back_populates="receipt_item_participants",
    )
