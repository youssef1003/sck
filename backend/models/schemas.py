from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    business_type: str
    message: str = Field(..., min_length=10, max_length=1000)

class ConsultationBooking(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    company: Optional[str] = None
    service_type: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None

class BlogPost(BaseModel):
    id: Optional[UUID] = None
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None

class AIMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    conversation_id: Optional[str] = None
    language: Optional[str] = "ar"  # ar or en

class AIResponse(BaseModel):
    response: str
    conversation_id: str
    intent: Optional[str] = None
    quick_replies: Optional[List[str]] = []
    context: Optional[Dict] = {}

class ChatContext(BaseModel):
    industry: Optional[str] = None
    company_size: Optional[str] = None
    problem: Optional[str] = None
    goals: Optional[str] = None
