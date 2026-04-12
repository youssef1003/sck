from fastapi import APIRouter, HTTPException
from models.schemas import ContactRequest
from services.supabase_client import supabase
from datetime import datetime

router = APIRouter()

@router.post("/submit")
async def submit_contact_form(contact: ContactRequest):
    """Submit contact form"""
    try:
        # Insert into Supabase
        data = {
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "business_type": contact.business_type,
            "message": contact.message,
            "created_at": datetime.utcnow().isoformat(),
            "status": "new"
        }
        
        result = supabase.table("contact_requests").insert(data).execute()
        
        return {
            "success": True,
            "message": "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً",
            "data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting contact form: {str(e)}")

@router.get("/requests")
async def get_contact_requests(limit: int = 50, status: str = None):
    """Get all contact requests (Admin only)"""
    try:
        query = supabase.table("contact_requests").select("*")
        
        if status:
            query = query.eq("status", status)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return {
            "success": True,
            "data": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contact requests: {str(e)}")
