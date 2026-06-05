from pydantic import BaseModel, Field
from typing import List, Optional

class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=1000)

class ClassifyResponse(BaseModel):
    kategori: str
    confidence: float
    response: str

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1000)
    user_id: str

class ChatMessageResponse(BaseModel):
    kategori: str
    confidence: float
    response: str
    complaint_id: Optional[str] = None

class ChatMessageItem(BaseModel):
    id: str
    complaint_id: str
    sender: str
    message: str
    created_at: str

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageItem]
