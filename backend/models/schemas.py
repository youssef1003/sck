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


# ===================== Authentication Models =====================

class UserLogin(BaseModel):
    """Login request model"""
    email: str = Field(..., description="Email or username")
    password: str = Field(..., min_length=6, description="Password")

class UserRegister(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    company: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field("client", description="User role: client, employer")

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict

class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str

class PasswordChange(BaseModel):
    """Password change request"""
    old_password: str
    new_password: str = Field(..., min_length=6)

# ===================== Sub-Admin Models =====================

class SubAdminCreate(BaseModel):
    """Create Sub-Admin request"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    permissions: List[str] = Field(default_factory=list)

class SubAdminUpdate(BaseModel):
    """Update Sub-Admin request"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None

class SubAdminResponse(BaseModel):
    """Sub-Admin response"""
    id: UUID
    username: str
    full_name: str
    email: Optional[str]
    role: str
    permissions: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

class PermissionsUpdate(BaseModel):
    """Update permissions for Sub-Admin"""
    permissions: List[str]

# ===================== User Management Models =====================

class UserResponse(BaseModel):
    """User response model"""
    id: UUID
    email: str
    full_name: str
    phone: Optional[str]
    company: Optional[str]
    role: str
    is_active: bool
    is_approved: Optional[bool]
    approval_status: Optional[str]
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class UserUpdate(BaseModel):
    """Update user request"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    company: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserRoleUpdate(BaseModel):
    """Update user role"""
    role: str = Field(..., description="New role: client, employer, consultant, subadmin, admin")

class UserStatusUpdate(BaseModel):
    """Update user status"""
    is_active: bool

# ===================== Employer Approval Models =====================

class EmployerApprovalResponse(BaseModel):
    """Employer approval response"""
    id: UUID
    user_id: UUID
    status: str
    approved_by: Optional[UUID]
    rejection_reason: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    user: Optional[UserResponse]

class EmployerApprovalUpdate(BaseModel):
    """Update employer approval status"""
    status: str = Field(..., description="Status: approved, rejected")
    rejection_reason: Optional[str] = None

# ===================== Admin Stats Models =====================

class AdminStats(BaseModel):
    """Admin dashboard statistics"""
    users: int
    bookings: int
    new_messages: int
    blog_posts: int
    pending_bookings: int
    pending_employers: int
    active_users: int
    total_revenue: Optional[float] = 0.0
