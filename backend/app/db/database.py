"""Модуль с общими компонентами для описания таблиц."""

from sqlalchemy import Column, Integer, MetaData

metadata = MetaData()


def id_column() -> Column:
    """Возвращает колонку 'id' для таблицы."""
    return Column("id", Integer, primary_key=True, autoincrement=True)
