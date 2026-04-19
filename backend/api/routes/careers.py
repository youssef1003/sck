from fastapi import APIRouter, HTTPException, Depends
from services.supabase_client import supabase
from services.auth import require_permission
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

router = APIRouter()

# ============================================================
# Pydantic Models
# ============================================================

class JobApplication(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    position: str
    experience_years: int
    education: str
    cv_url: Optional[str] = None
    cover_letter: Optional[str] = None
    linkedin_url: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str

# ============================================================
# Public Endpoints
# ============================================================

@router.post("/apply")
async def submit_job_application(application: JobApplication):
    """Submit a job application (public endpoint)"""
    try:
        data = {
            "full_name": application.full_name,
            "email": application.email,
            "phone": application.phone,
            "position": application.position,
            "experience_years": application.experience_years,
            "education": application.education,
            "cv_url": application.cv_url,
            "cover_letter": application.cover_letter,
            "linkedin_url": application.linkedin_url,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("job_applications").insert(data).execute()
        
        return {
            "success": True,
            "message": "تم تقديم طلبك بنجاح. سنتواصل معك قريباً",
            "data": result.data[0] if result.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting application: {str(e)}")

# ============================================================
# Admin Endpoints
# ============================================================

@router.get("/applications")
async def get_all_applications(
    status: Optional[str] = None,
    position: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: Dict[str, Any] = Depends(require_permission("careers_view"))
):
    """Get all job applications (Admin only)"""
    try:
        query = supabase.table("job_applications").select("*", count="exact")

        if status and status != "all":
            query = query.eq("status", status)

        if position and position != "all":
            query = query.eq("position", position)

        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%,phone.ilike.%{search}%")

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "success": True,
            "data": result.data,
            "count": result.count or len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching applications: {str(e)}")

@router.get("/applications/{application_id}")
async def get_application_details(
    application_id: UUID,
    current_user: Dict[str, Any] = Depends(require_permission("careers_view"))
):
    """Get single application details (Admin only)"""
    try:
        result = supabase.table("job_applications").select("*").eq("id", str(application_id)).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "success": True,
            "data": result.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching application: {str(e)}")

@router.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: UUID,
    status_update: ApplicationStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_permission("careers_edit"))
):
    """Update application status (Admin only)"""
    valid_statuses = ["pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    try:
        result = supabase.table("job_applications").update({
            "status": status_update.status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(application_id)).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "success": True,
            "message": "تم تحديث حالة الطلب بنجاح",
            "data": result.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating application: {str(e)}")

@router.delete("/applications/{application_id}")
async def delete_application(
    application_id: UUID,
    current_user: Dict[str, Any] = Depends(require_permission("careers_delete"))
):
    """Delete application (Admin only)"""
    try:
        result = supabase.table("job_applications").delete().eq("id", str(application_id)).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "success": True,
            "message": "تم حذف الطلب بنجاح"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting application: {str(e)}")

@router.get("/stats")
async def get_careers_stats(
    current_user: Dict[str, Any] = Depends(require_permission("careers_view"))
):
    """Get careers statistics (Admin only)"""
    try:
        total = supabase.table("job_applications").select("id", count="exact").execute()
        pending = supabase.table("job_applications").select("id", count="exact").eq("status", "pending").execute()
        reviewing = supabase.table("job_applications").select("id", count="exact").eq("status", "reviewing").execute()
        shortlisted = supabase.table("job_applications").select("id", count="exact").eq("status", "shortlisted").execute()
        accepted = supabase.table("job_applications").select("id", count="exact").eq("status", "accepted").execute()
        rejected = supabase.table("job_applications").select("id", count="exact").eq("status", "rejected").execute()

        return {
            "success": True,
            "data": {
                "total": total.count or 0,
                "pending": pending.count or 0,
                "reviewing": reviewing.count or 0,
                "shortlisted": shortlisted.count or 0,
                "accepted": accepted.count or 0,
                "rejected": rejected.count or 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
