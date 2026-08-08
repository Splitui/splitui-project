import re

from sqlalchemy.orm import DeclarativeBase,declared_attr


class Base(DeclarativeBase):

    @declared_attr.directive
    def __tablename__(cls) -> str:

        table_name = re.sub(
            r"(?<!^)(?=[A-Z])",
            "_",
            cls.__name__,
        ).lower()

        return table_name
