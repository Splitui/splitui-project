""" Сервис для работы с бизнес-логикой встреч """

from sqlalchemy.engine import Connection

from app.repositories import meeting_repository, participant_repository
from app.schemas.meeting import MeetingCreate
from app.schemas.participants import ParticipantCreate


def get_meetings(connection: Connection):
    """ Получение всех встреч в системе """

    return meeting_repository.get_all(connection)


def get_meeting(connection: Connection, meeting_uuid):
    """ 
    Получение встречи по uuid

    meeting_uuid:  индификатор встречи 
    
    """

    return meeting_repository.get_by_uuid(connection, meeting_uuid)


def create_meeting(connection: Connection, data: MeetingCreate):

    """ 
        Создание встречи с админом встречи
    
        data:  информация о встрече 
        
    """

    meeting = meeting_repository.create(
        connection,
        data.title,
        data.meeting_date,
    )

    participant_repository.create(
        connection=connection,
        meeting_id=meeting["id"],
        nickname=data.creator_nickname,
        is_creator=True
    )

    return meeting


def get_participants(connection, meeting_uuid):
    """ 
    Получение участников встречи по uuid

    meeting_uuid:  индификатор встречи 
        
    """
    
    return participant_repository.get_all_by_meeting_uuid(connection, meeting_uuid)


def add_participant(connection, meeting_uuid, data: ParticipantCreate):
    """ 
        добавление участника встречи по uuid встречи
    
        meeting_uuid:  индификатор встречи 
        
        data: информация об участнике
        """

    meeting = meeting_repository.get_by_uuid(connection, meeting_uuid)

    return participant_repository.create(
        connection,
        meeting["id"],
        data.nickname,
        False
    )
