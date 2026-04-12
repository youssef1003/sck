from fastapi import APIRouter, HTTPException
from models.schemas import ConsultationBooking
from services.supabase_client import supabase
from datetime import datetime
from uuid import UUID

router = APIRouter()

@router.post("/book")
async def book_consultation(booking: ConsultationBooking):
    """Book a consultation"""
    try:
        data = {
            "name": booking.name,
            "email": booking.email,
            "phone": booking.phone,
            "company": booking.company,
            "service_type": booking.service_type,
            "preferred_date": booking.preferred_date,
            "preferred_time": booking.preferred_time,
            "notes": booking.notes,
            "created_at": datetime.utcnow().isoformat(),
            "status": "pending"
        }
        
        result = supabase.table("consultation_bookings").insert(data).execute()
        
        return {
            "success": True,
            "message": "تم حجز الاستشارة بنجاح. سنتواصل معك لتأكيد الموعد",
            "booking_id": result.data[0]["id"] if result.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error booking consultation: {str(e)}")

@router.get("/bookings")
async def get_bookings(limit: int = 50, status: str = None):
    """Get all consultation bookings (Admin only)"""
    try:
        query = supabase.table("consultation_bookings").select("*")
        
        if status:
            query = query.eq("status", status)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return {
            "success": True,
            "data": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")

@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: UUID, status: str):
    """Update booking status (Admin only)"""
    try:
        result = supabase.table("consultation_bookings").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(booking_id)).execute()
        
        return {
            "success": True,
            "message": "تم تحديث حالة الحجز",
            "data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating booking status: {str(e)}")
