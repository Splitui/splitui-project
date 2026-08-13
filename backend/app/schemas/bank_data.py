"""Модуль со схемами для работы с банковскими реквизитами."""

from pydantic import BaseModel, Field, model_validator


class BankDataCreate(BaseModel):
    """Схема для создания участника встречи.

    :ivar bank_id: идентификатор банка.
    :ivar card_number: номер банковской карты.
    :ivar phone_number: номер телефона.
    """

    bank_id: int
    card_number: str | None = Field(None, max_length=25)
    phone_number: str | None = Field(None, max_length=15)

    @model_validator(mode="after")
    def validate_bank_data(self):
        has_card = self.card_number is not None
        has_phone = self.phone_number is not None
        if has_card == has_phone:
            raise ValueError("Укажите либо номер карты, либо номер телефона")

        return self
