from collections.abc import Generator

from sqlalchemy.engine import Connection

from app.db.session import engine


def get_connection() -> Generator[Connection, None, None]:
    with engine.connect() as connection:
        yield connection