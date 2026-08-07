from pydantic import BaseModel, Field


class ReceiptCreate(BaseModel):
    payer_id: int
    title: str = Field(min_length=0, max_length=100)
    category: str | None = Field(default=None, max_length=50)
    comment: str | None = None
    image_url: str | None = None
    is_confirmed : bool = False