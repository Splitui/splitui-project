"""Модуль со схемами для работы с участниками встречи."""

from pydantic import BaseModel, Field, model_validator


class ParticipantCreate(BaseModel):
    """Схема для создания участника встречи.

    :ivar nickname: никнейм участника встречи.
    """

    nickname: str = Field(min_length=1, max_length=50)

class ParticipantUpdate(BaseModel):
    """Схема для обновления данных участника.

    :ivar nickname: новый никнейм участника.
    :ivar bank_id: id банка.
    :ivar card_number: номер карты.
    :ivar phone_number: номер телефона.
    """

    nickname: str | None = Field(default=None, min_length=1, max_length=50)
    bank_id: int | None = None
    card_number: str | None = Field(default=None, min_length=1, max_length=20)
    phone_number: str | None = Field(default=None, min_length=1, max_length=15)

    @model_validator(mode="after")
    def validate_bank_data(self):
        has_card = self.card_number is not None
        has_phone = self.phone_number is not None

        if has_card and has_phone:
            raise ValueError("Укажите либо номер карты, либо номер телефона")

        if (has_card or has_phone) and self.bank_id is None:
            raise ValueError("Не выбран банк")

        return self