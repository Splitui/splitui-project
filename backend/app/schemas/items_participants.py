from decimal import Decimal

from pydantic import BaseModel, Field


class ParticipantReceipt(BaseModel):
    participant_id: int = Field(ge=0)
    quantity: int = Field(ge=0)

class ItemsParticipantsCreate(BaseModel):
    participants: list[ParticipantReceipt]
    
