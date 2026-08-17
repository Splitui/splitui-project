"""Модуль со схемами для работы с кешбэками."""

from pydantic import BaseModel, Field, field_validator


class CashbackCategoryItem(BaseModel):
    """Схема одной категории кешбека с процентом.

    :ivar category_id: идентификатор категории кешбека.
    :ivar percent: процент кешбека по категории.
    """

    category_id: int = Field(ge=1)
    percent: float = Field(ge=0, le=100)


class ParticipantCashbackCategoriesUpdate(BaseModel):
    """Схема для полной замены набора категорий кешбека участника.

    :ivar categories: список выбранных категорий с процентами.
    """

    categories: list[CashbackCategoryItem]

    @field_validator("categories")
    @classmethod
    def validate_unique_categories(cls, categories: list[CashbackCategoryItem]):
        category_ids = [c.category_id for c in categories]
        if len(category_ids) != len(set(category_ids)):
            raise ValueError("Категории кешбека не должны повторяться в списке")
        return categories
