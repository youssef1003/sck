"""
Employers Management Routes
Handles employer approval workflow and management
Admin only
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

from models.schemas import (
    UserResponse,
    EmployerApprovalResponse,
    EmployerApprovalUpdate
)
from services.auth import (
    get_current_admin,
    require_any_permission
)
from services.supabase_client import supabase

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_all_employers(
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_view", "employers_approve")),
    status_filter: Optional[str] = Query(None, description="Filter by approval status: pending, approved, rejected"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all employer accounts
    
    - Admin/Sub-Admin with employers_view permission
    - Can filter by approval status
    - Returns list of employers with approval status
    """
    try:
        # Build query
        query = supabase.table("users").select("*").eq("role", "employer").eq(
            "deleted_at", None
        )
        
        # Apply status filter
        if status_filter:
            query = query.eq("approval_status", status_filter)
        
        query = query.order("created_at", desc=True).limit(limit).offset(offset)
        
        result = query.execute()
        
        if not result.data:
            return []
        
        return [UserResponse(**user) for user in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get employers: {str(e)}"
        )


@router.get("/pending", response_model=List[UserResponse])
async def get_pending_employers(
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_view", "employers_approve")),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all pending employer approvals
    
    - Admin/Sub-Admin with employers_view permission
    - Returns employers waiting for approval
    """
    try:
        query = supabase.table("users").select("*").eq("role", "employer").eq(
            "approval_status", "pending"
        ).eq("deleted_at", None).order("created_at", desc=True).limit(limit).offset(offset)
        
        result = query.execute()
        
        if not result.data:
            return []
        
        return [UserResponse(**user) for user in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending employers: {str(e)}"
        )


@router.get("/{employer_id}", response_model=UserResponse)
async def get_employer(
    employer_id: UUID,
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_view", "employers_approve"))
):
    """
    Get specific employer by ID
    
    - Admin/Sub-Admin with employers_view permission
    - Returns employer details with approval status
    """
    try:
        user_query = supabase.table("users").select("*").eq("id", str(employer_id)).eq(
            "role", "employer"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        return UserResponse(**user_query.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get employer: {str(e)}"
        )


@router.get("/{employer_id}/approval", response_model=EmployerApprovalResponse)
async def get_employer_approval(
    employer_id: UUID,
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_view", "employers_approve"))
):
    """
    Get employer approval details
    
    - Admin/Sub-Admin with employers_view permission
    - Returns approval record with history
    """
    try:
        approval_query = supabase.table("employer_approvals").select("*").eq(
            "user_id", str(employer_id)
        ).execute()
        
        if not approval_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval record not found"
            )
        
        approval = approval_query.data[0]
        
        # Get user data
        user_query = supabase.table("users").select("*").eq("id", str(employer_id)).execute()
        user = user_query.data[0] if user_query.data else None
        
        return EmployerApprovalResponse(
            **approval,
            user=UserResponse(**user) if user else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get approval: {str(e)}"
        )


@router.put("/{employer_id}/approve")
async def approve_employer(
    employer_id: UUID,
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_approve"))
):
    """
    Approve employer account
    
    - Admin/Sub-Admin with employers_approve permission
    - Sets approval status to approved
    - Activates employer account
    """
    try:
        # Check if employer exists
        user_query = supabase.table("users").select("*").eq("id", str(employer_id)).eq(
            "role", "employer"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        # Update user
        supabase.table("users").update({
            "is_approved": True,
            "approval_status": "approved",
            "is_active": True,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(employer_id)).execute()
        
        # Update approval record
        approval_update = {
            "status": "approved",
            "approved_by": current_user["user_id"],
            "approved_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if approval record exists
        approval_query = supabase.table("employer_approvals").select("*").eq(
            "user_id", str(employer_id)
        ).execute()
        
        if approval_query.data:
            supabase.table("employer_approvals").update(approval_update).eq(
                "user_id", str(employer_id)
            ).execute()
        else:
            approval_update["user_id"] = str(employer_id)
            supabase.table("employer_approvals").insert(approval_update).execute()
        
        return {"message": "Employer approved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve employer: {str(e)}"
        )


@router.put("/{employer_id}/reject")
async def reject_employer(
    employer_id: UUID,
    rejection_data: EmployerApprovalUpdate,
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_reject"))
):
    """
    Reject employer account
    
    - Admin/Sub-Admin with employers_reject permission
    - Sets approval status to rejected
    - Can provide rejection reason
    """
    try:
        # Check if employer exists
        user_query = supabase.table("users").select("*").eq("id", str(employer_id)).eq(
            "role", "employer"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        # Update user
        supabase.table("users").update({
            "is_approved": False,
            "approval_status": "rejected",
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", str(employer_id)).execute()
        
        # Update approval record
        approval_update = {
            "status": "rejected",
            "approved_by": current_user["user_id"],
            "rejection_reason": rejection_data.rejection_reason,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if approval record exists
        approval_query = supabase.table("employer_approvals").select("*").eq(
            "user_id", str(employer_id)
        ).execute()
        
        if approval_query.data:
            supabase.table("employer_approvals").update(approval_update).eq(
                "user_id", str(employer_id)
            ).execute()
        else:
            approval_update["user_id"] = str(employer_id)
            supabase.table("employer_approvals").insert(approval_update).execute()
        
        return {"message": "Employer rejected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject employer: {str(e)}"
        )


@router.delete("/{employer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employer(
    employer_id: UUID,
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_delete"))
):
    """
    Delete employer account
    
    - Admin/Sub-Admin with employers_delete permission
    - Soft delete (sets deleted_at timestamp)
    """
    try:
        # Check if employer exists
        user_query = supabase.table("users").select("*").eq("id", str(employer_id)).eq(
            "role", "employer"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        # Soft delete
        supabase.table("users").update({
            "deleted_at": datetime.utcnow().isoformat(),
            "is_active": False
        }).eq("id", str(employer_id)).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete employer: {str(e)}"
        )


@router.get("/stats/summary")
async def get_employer_stats(
    current_user: Dict[str, Any] = Depends(require_any_permission("employers_view", "analytics_view"))
):
    """
    Get employer statistics
    
    - Admin/Sub-Admin with employers_view or analytics_view permission
    - Returns counts by status
    """
    try:
        # Get total employers
        total_query = supabase.table("users").select("id", count="exact").eq(
            "role", "employer"
        ).eq("deleted_at", None).execute()
        
        # Get pending
        pending_query = supabase.table("users").select("id", count="exact").eq(
            "role", "employer"
        ).eq("approval_status", "pending").eq("deleted_at", None).execute()
        
        # Get approved
        approved_query = supabase.table("users").select("id", count="exact").eq(
            "role", "employer"
        ).eq("approval_status", "approved").eq("deleted_at", None).execute()
        
        # Get rejected
        rejected_query = supabase.table("users").select("id", count="exact").eq(
            "role", "employer"
        ).eq("approval_status", "rejected").eq("deleted_at", None).execute()
        
        return {
            "total": total_query.count or 0,
            "pending": pending_query.count or 0,
            "approved": approved_query.count or 0,
            "rejected": rejected_query.count or 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )
