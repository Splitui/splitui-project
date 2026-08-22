"""Модуль для заполнения справочных таблиц начальными данными."""

from sqlalchemy import text

from app.db.engine import engine

CASHBACK_CATEGORIES = [
    "Кафе",
    "Супермаркеты",
    "АЗС",
    "Транспорт",
    "Развлечения"
]

BANKS = [
    (
        "Сбербанк",
        "https://www.sberbank.com/sms/pbpn?requisiteNumber={phone}"
    ),
    ("Альфа-Банк", None),
    ("ВТБ", None),
    (
        "Т-Банк",
        "https://t.tb.ru/c2c-qr-choose-bank?requisiteNumber={phone}&bankCode=100000000004"
    ),
    ("Райффайзен Банк", None),
    ("OZON Банк", None)
]


def seed_reference_data():
    """Заполняет справочные таблицы данными."""
    with engine.begin() as connection:
        _seed_categories(connection, CASHBACK_CATEGORIES)
        _seed_banks(connection, BANKS)

    print("Справочные данные успешно заполнены")


def _seed_categories(connection, names: list[str]):
    """Загружает категории кешбека в базу.

    :param connection: соединение с базой данных.
    :param names: список названий категорий.
    """
    existing = connection.execute(text("SELECT name FROM cashback_categories"))
    existing_names = {row[0] for row in existing}

    for name in names:
        if name not in existing_names:
            connection.execute(
                text("INSERT INTO cashback_categories (name) VALUES (:name)"),
                {"name": name}
            )


def _seed_banks(connection, banks: list[tuple]):
    """Загружает данные о банках в базу.

    :param connection: соединение с базой данных.
    :param banks: данные банков.
    """
    existing_banks = connection.execute(text("SELECT name FROM banks"))
    existing_names = {row[0] for row in existing_banks}

    for name, deeplink in banks:
        if name not in existing_names:
            connection.execute(
                text("INSERT INTO banks (name, deeplink) VALUES (:name, :deeplink)"),
                {
                    "name": name,
                    "deeplink": deeplink
                }
            )
