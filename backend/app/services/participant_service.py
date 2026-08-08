""" Сервис для работы с бизнес-логикой участников встреч """

from sqlalchemy.engine import Connection

from app.repositories import participant_repository
from app.schemas.participants import ParticipantCreate


def get_participants(connection: Connection):
    """ Получение все пользователей в системе """

    return participant_repository.get_all(connection)
