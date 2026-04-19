from fastapi import APIRouter, HTTPException, Header
from services.supabase_client import supabase
from models.schemas import BlogPost
from datetime import datetime
from typing import Optional
from uuid import UUID

router = APIRouter()

# ============================================================
# Admin Auth Middleware
# ============================================================
def verify_admin(admin_token: Optional[str] = Header(None)):
    """Verify admin authentication via header token"""
    if not admin_token or admin_token != "authenticated":
        raise HTTPException(status_code=401, detail="Unauthorized: Admin access required")
    return True

# ============================================================
# Dashboard Stats
# ============================================================
@router.get("/stats")
async def get_dashboard_stats(admin_token: Optional[str] = Header(None)):
    """Get dashboard overview stats"""
    verify_admin(admin_token)
    try:
        users = supabase.table("users").select("id", count="exact").execute()
        bookings = supabase.table("consultation_bookings").select("id", count="exact").execute()
        contacts = supabase.table("contact_requests").select("id", count="exact").execute()
        blog = supabase.table("blog_posts").select("id", count="exact").execute()

        # Get recent counts
        pending_bookings = supabase.table("consultation_bookings").select("id", count="exact").eq("status", "pending").execute()
        new_messages = supabase.table("contact_requests").select("id", count="exact").eq("status", "new").execute()

        return {
            "success": True,
            "data": {
                "users": users.count or 0,
                "bookings": bookings.count or 0,
                "contacts": contacts.count or 0,
                "blog_posts": blog.count or 0,
                "pending_bookings": pending_bookings.count or 0,
                "new_messages": new_messages.count or 0,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# ============================================================
# Users Management
# ============================================================
@router.get("/users")
async def get_users(
    admin_token: Optional[str] = Header(None),
    search: Optional[str] = None,
    role: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all users with search and filter"""
    verify_admin(admin_token)
    try:
        query = supabase.table("users").select("*", count="exact").is_("deleted_at", "null")

        if role and role != "all":
            query = query.eq("role", role)

        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%,phone.ilike.%{search}%")

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "success": True,
            "data": result.data,
            "count": result.count or len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: UUID, role: str, admin_token: Optional[str] = Header(None)):
    """Update user role"""
    verify_admin(admin_token)
    valid_roles = ["client", "admin", "consultant", "subadmin", "user", "employer"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
    try:
        result = supabase.table("users").update({
            "role": role,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(user_id)).execute()
        return {"success": True, "message": "تم تحديث الدور بنجاح", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user role: {str(e)}")

@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: UUID, is_active: bool, admin_token: Optional[str] = Header(None)):
    """Activate or deactivate user"""
    verify_admin(admin_token)
    try:
        result = supabase.table("users").update({
            "is_active": is_active,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(user_id)).execute()
        status_text = "تفعيل" if is_active else "تعطيل"
        return {"success": True, "message": f"تم {status_text} المستخدم بنجاح", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user status: {str(e)}")

@router.delete("/users/{user_id}")
async def soft_delete_user(user_id: UUID, admin_token: Optional[str] = Header(None)):
    """Soft delete user"""
    verify_admin(admin_token)
    try:
        result = supabase.table("users").update({
            "deleted_at": datetime.utcnow().isoformat(),
            "is_active": False
        }).eq("id", str(user_id)).execute()
        return {"success": True, "message": "تم حذف المستخدم بنجاح"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

# ============================================================
# Bookings Management
# ============================================================
@router.get("/bookings")
async def get_all_bookings(
    admin_token: Optional[str] = Header(None),
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all consultation bookings"""
    verify_admin(admin_token)
    try:
        query = supabase.table("consultation_bookings").select("*", count="exact").is_("deleted_at", "null")

        if status and status != "all":
            query = query.eq("status", status)

        if search:
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%,phone.ilike.%{search}%")

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "success": True,
            "data": result.data,
            "count": result.count or len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")

@router.patch("/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: UUID, status: str, admin_token: Optional[str] = Header(None)):
    """Update booking status"""
    verify_admin(admin_token)
    valid = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    try:
        result = supabase.table("consultation_bookings").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(booking_id)).execute()
        return {"success": True, "message": "تم تحديث حالة الحجز", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating booking: {str(e)}")

# ============================================================
# Messages (Contact Requests) Management
# ============================================================
@router.get("/messages")
async def get_all_messages(
    admin_token: Optional[str] = Header(None),
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all contact messages"""
    verify_admin(admin_token)
    try:
        query = supabase.table("contact_requests").select("*", count="exact").is_("deleted_at", "null")

        if status and status != "all":
            query = query.eq("status", status)

        if search:
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%,phone.ilike.%{search}%")

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "success": True,
            "data": result.data,
            "count": result.count or len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@router.patch("/messages/{message_id}/status")
async def update_message_status(message_id: UUID, status: str, admin_token: Optional[str] = Header(None)):
    """Update message status"""
    verify_admin(admin_token)
    valid = ["new", "pending", "resolved", "rejected"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    try:
        result = supabase.table("contact_requests").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(message_id)).execute()
        return {"success": True, "message": "تم تحديث حالة الرسالة", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating message: {str(e)}")

@router.delete("/messages/{message_id}")
async def delete_message(message_id: UUID, admin_token: Optional[str] = Header(None)):
    """Soft delete message"""
    verify_admin(admin_token)
    try:
        result = supabase.table("contact_requests").update({
            "deleted_at": datetime.utcnow().isoformat()
        }).eq("id", str(message_id)).execute()
        return {"success": True, "message": "تم حذف الرسالة"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting message: {str(e)}")

# ============================================================
# Blog Management
# ============================================================
@router.get("/blog")
async def get_all_blog_posts(
    admin_token: Optional[str] = Header(None),
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all blog posts including unpublished"""
    verify_admin(admin_token)
    try:
        query = supabase.table("blog_posts").select("*", count="exact").is_("deleted_at", "null")

        if category and category != "all":
            query = query.eq("category", category)

        if search:
            query = query.or_(f"title.ilike.%{search}%,author.ilike.%{search}%")

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "success": True,
            "data": result.data,
            "count": result.count or len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching blog posts: {str(e)}")

@router.post("/blog")
async def admin_create_blog_post(post: BlogPost, admin_token: Optional[str] = Header(None)):
    """Create new blog post"""
    verify_admin(admin_token)
    try:
        data = {
            "title": post.title,
            "excerpt": post.excerpt,
            "content": post.content,
            "author": post.author,
            "category": post.category,
            "image_url": post.image_url,
            "is_published": True,
            "published_at": datetime.utcnow().isoformat()
        }
        result = supabase.table("blog_posts").insert(data).execute()
        return {"success": True, "message": "تم إنشاء المقال بنجاح", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating blog post: {str(e)}")

@router.put("/blog/{post_id}")
async def update_blog_post(post_id: UUID, post: BlogPost, admin_token: Optional[str] = Header(None)):
    """Update blog post"""
    verify_admin(admin_token)
    try:
        data = {
            "title": post.title,
            "excerpt": post.excerpt,
            "content": post.content,
            "author": post.author,
            "category": post.category,
            "image_url": post.image_url,
            "updated_at": datetime.utcnow().isoformat()
        }
        result = supabase.table("blog_posts").update(data).eq("id", str(post_id)).execute()
        return {"success": True, "message": "تم تحديث المقال بنجاح", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating blog post: {str(e)}")

@router.patch("/blog/{post_id}/publish")
async def toggle_blog_publish(post_id: UUID, is_published: bool, admin_token: Optional[str] = Header(None)):
    """Toggle blog post publish status"""
    verify_admin(admin_token)
    try:
        result = supabase.table("blog_posts").update({
            "is_published": is_published,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(post_id)).execute()
        action = "نشر" if is_published else "إلغاء نشر"
        return {"success": True, "message": f"تم {action} المقال بنجاح", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling publish: {str(e)}")

@router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: UUID, admin_token: Optional[str] = Header(None)):
    """Soft delete blog post"""
    verify_admin(admin_token)
    try:
        result = supabase.table("blog_posts").update({
            "deleted_at": datetime.utcnow().isoformat()
        }).eq("id", str(post_id)).execute()
        return {"success": True, "message": "تم حذف المقال بنجاح"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting blog post: {str(e)}")
