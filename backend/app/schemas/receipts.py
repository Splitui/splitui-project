"""Модуль со схемами для работы с чеками."""

from pydantic import BaseModel, Field


class ReceiptCreate(BaseModel):
    """Схема для создания чека.

    :ivar payer_id: идентификатор плательщика.
    :ivar title: наименование чека.
    :ivar category: категория чека.
    :ivar comment: комментарий к чеку.
    :ivar image_url: ссылка на изображение чека.
    :ivar is_confirmed: признак подтверждения чека.
    """

    payer_id: int
    title: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=50)
    comment: str | None = None
    image_url: str | None = None
    is_confirmed: bool = False
