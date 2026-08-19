from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.repositories import receipts_repository, receipt_items_repository, participants_repository
from app.services import meetings_service, participants_service
from app.services.meetings_service import get_meeting_or_error




def get_amount_info(connection:Connection,meeting_uuid: UUID, session_id: str, participant_id: int):

    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    _ = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    _ = participants_service.get_participant_or_error(connection, meeting["id"], participant_id)

    meeting_amount = receipts_repository.get_meeting_total_amount(connection,meeting_uuid)

    if meeting_amount is None:
        meeting_amount = 0

    participant_spend = receipts_repository.get_participant_spend(connection,participant_id,meeting["id"])

    if participant_spend is None:
        participant_spend = 0

    participant_debt = receipt_items_repository.get_participant_debt(connection,participant_id)

    if participant_debt is None:
        participant_debt = 0

    return  {
         "meeting_amount": meeting_amount,
         "participant_spend": participant_spend,
         "participant_debt": participant_debt,
    }