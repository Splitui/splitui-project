from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ParticipantCashbackCategory(Base):
    __tablename__ = "participant_cashback_categories"

    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id"),
        primary_key=True,
    )

    cashback_category_id: Mapped[int] = mapped_column(
        ForeignKey("cashback_categories.id"),
        primary_key=True,
    )

    cashback_percent: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
