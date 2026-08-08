"""Объявление связи позиции в чеке и и участника чека """

from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReceiptItemParticipant(Base):

    """
    Связь позиция-участник

    receipt_item_id: индификатор чека

    participant_id: индификатор участника чека

    share_amount: кол-во которое участник взял себе
    """

    receipt_item_id: Mapped[int] = mapped_column(
        ForeignKey("receipt_items.id"),
        primary_key=True,
    )

    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        primary_key=True,
    )

    share_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
