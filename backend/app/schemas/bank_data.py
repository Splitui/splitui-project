"""Модуль со схемами для работы с банковскими реквизитами."""

from pydantic import BaseModel, Field, model_validator

from app.schemas.utils.validators import CardNumber, PhoneNumber


class BankDataCreate(BaseModel):
    """Схема для создания банковских реквизитов участника встречи.

    :ivar bank_id: идентификатор банка.
    :ivar card_number: номер банковской карты.
    :ivar phone_number: номер телефона.
    """

    bank_id: int = Field(ge=1)
    card_number: CardNumber = None
    phone_number: PhoneNumber = None

    @model_validator(mode="after")
    def validate_bank_data(self):
        if self.card_number is None and self.phone_number is None:
            raise ValueError("Укажите номер карты и/или номер телефона")

        return self
