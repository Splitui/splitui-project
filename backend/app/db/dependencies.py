from collections.abc import Generator
from sqlalchemy.engine import Connection

from app.db.engine import engine


def get_connection():
    with engine.begin() as connection:
        yield connection
