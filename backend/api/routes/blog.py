from fastapi import APIRouter, HTTPException
from models.schemas import BlogPost
from services.supabase_client import supabase
from typing import Optional
from uuid import UUID

router = APIRouter()

@router.get("/posts")
async def get_blog_posts(limit: int = 10, category: Optional[str] = None):
    """Get all blog posts"""
    try:
        query = supabase.table("blog_posts").select("*")
        
        if category and category != "الكل":
            query = query.eq("category", category)
        
        result = query.order("published_at", desc=True).limit(limit).execute()
        
        return {
            "success": True,
            "data": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching blog posts: {str(e)}")

@router.get("/posts/{post_id}")
async def get_blog_post(post_id: UUID):
    """Get single blog post"""
    try:
        result = supabase.table("blog_posts").select("*").eq("id", str(post_id)).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        return {
            "success": True,
            "data": result.data[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching blog post: {str(e)}")

@router.post("/posts")
async def create_blog_post(post: BlogPost):
    """Create new blog post (Admin only)"""
    try:
        data = {
            "title": post.title,
            "excerpt": post.excerpt,
            "content": post.content,
            "author": post.author,
            "category": post.category,
            "image_url": post.image_url,
            "published_at": post.published_at.isoformat() if post.published_at else None
        }
        
        result = supabase.table("blog_posts").insert(data).execute()
        
        return {
            "success": True,
            "message": "تم إنشاء المقال بنجاح",
            "data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating blog post: {str(e)}")
