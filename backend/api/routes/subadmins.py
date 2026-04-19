"""
Sub-Admins Management Routes
Handles CRUD operations for sub-admin accounts and their permissions
Super Admin only
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

from models.schemas import (
    SubAdminCreate,
    SubAdminUpdate,
    SubAdminResponse,
    PermissionsUpdate,
    UserResponse
)
from services.auth import (
    hash_password,
    get_current_super_admin
)
from services.supabase_client import supabase

router = APIRouter()


@router.get("/", response_model=List[SubAdminResponse])
async def get_all_subadmins(
    current_user: Dict[str, Any] = Depends(get_current_super_admin),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all sub-admin accounts
    
    - Super Admin only
    - Returns list of sub-admins with their permissions
    """
    try:
        # Get all sub-admins
        query = supabase.table("users").select("*").eq("role", "subadmin").eq(
            "deleted_at", None
        ).order("created_at", desc=True).limit(limit).offset(offset)
        
        result = query.execute()
        
        if not result.data:
            return []
        
        # Get permissions for each sub-admin
        subadmins = []
        for user in result.data:
            # Get permissions
            perm_query = supabase.table("admin_permissions").select("permissions").eq(
                "user_id", user["id"]
            ).execute()
            
            permissions = []
            if perm_query.data:
                permissions = perm_query.data[0].get("permissions", [])
            
            subadmins.append({
                **user,
                "permissions": permissions
            })
        
        return [SubAdminResponse(**admin) for admin in subadmins]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sub-admins: {str(e)}"
        )


@router.get("/{subadmin_id}", response_model=SubAdminResponse)
async def get_subadmin(
    subadmin_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Get specific sub-admin by ID
    
    - Super Admin only
    - Returns sub-admin details with permissions
    """
    try:
        # Get sub-admin
        user_query = supabase.table("users").select("*").eq("id", str(subadmin_id)).eq(
            "role", "subadmin"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sub-admin not found"
            )
        
        user = user_query.data[0]
        
        # Get permissions
        perm_query = supabase.table("admin_permissions").select("permissions").eq(
            "user_id", str(subadmin_id)
        ).execute()
        
        permissions = []
        if perm_query.data:
            permissions = perm_query.data[0].get("permissions", [])
        
        return SubAdminResponse(**{**user, "permissions": permissions})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sub-admin: {str(e)}"
        )


@router.post("/", response_model=SubAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_subadmin(
    subadmin_data: SubAdminCreate,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Create new sub-admin account
    
    - Super Admin only
    - Creates user with subadmin role
    - Sets initial permissions
    """
    try:
        # Check if username already exists
        existing_user = supabase.table("users").select("*").eq(
            "email", subadmin_data.username
        ).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Hash password
        password_hash = hash_password(subadmin_data.password)
        
        # Create user
        user_insert = {
            "email": subadmin_data.username,  # Using username as email for sub-admins
            "password_hash": password_hash,
            "full_name": subadmin_data.full_name,
            "role": "subadmin",
            "is_active": True,
            "metadata": {
                "username": subadmin_data.username,
                "created_by": current_user["user_id"]
            }
        }
        
        result = supabase.table("users").insert(user_insert).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create sub-admin"
            )
        
        user = result.data[0]
        
        # Create permissions record
        perm_insert = {
            "user_id": user["id"],
            "permissions": subadmin_data.permissions,
            "created_by": current_user["user_id"]
        }
        
        supabase.table("admin_permissions").insert(perm_insert).execute()
        
        return SubAdminResponse(**{**user, "permissions": subadmin_data.permissions})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sub-admin: {str(e)}"
        )


@router.put("/{subadmin_id}", response_model=SubAdminResponse)
async def update_subadmin(
    subadmin_id: UUID,
    subadmin_data: SubAdminUpdate,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Update sub-admin account
    
    - Super Admin only
    - Can update profile, password, permissions, and status
    """
    try:
        # Check if sub-admin exists
        user_query = supabase.table("users").select("*").eq("id", str(subadmin_id)).eq(
            "role", "subadmin"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sub-admin not found"
            )
        
        # Prepare update data
        update_data = {}
        
        if subadmin_data.full_name is not None:
            update_data["full_name"] = subadmin_data.full_name
        
        if subadmin_data.email is not None:
            update_data["email"] = subadmin_data.email
        
        if subadmin_data.password is not None:
            update_data["password_hash"] = hash_password(subadmin_data.password)
        
        if subadmin_data.is_active is not None:
            update_data["is_active"] = subadmin_data.is_active
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            supabase.table("users").update(update_data).eq("id", str(subadmin_id)).execute()
        
        # Update permissions if provided
        if subadmin_data.permissions is not None:
            perm_update = {
                "permissions": subadmin_data.permissions,
                "updated_by": current_user["user_id"],
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Check if permissions record exists
            perm_query = supabase.table("admin_permissions").select("*").eq(
                "user_id", str(subadmin_id)
            ).execute()
            
            if perm_query.data:
                # Update existing
                supabase.table("admin_permissions").update(perm_update).eq(
                    "user_id", str(subadmin_id)
                ).execute()
            else:
                # Create new
                perm_update["user_id"] = str(subadmin_id)
                perm_update["created_by"] = current_user["user_id"]
                supabase.table("admin_permissions").insert(perm_update).execute()
        
        # Get updated sub-admin
        updated_user = supabase.table("users").select("*").eq("id", str(subadmin_id)).execute()
        user = updated_user.data[0]
        
        # Get permissions
        perm_query = supabase.table("admin_permissions").select("permissions").eq(
            "user_id", str(subadmin_id)
        ).execute()
        
        permissions = []
        if perm_query.data:
            permissions = perm_query.data[0].get("permissions", [])
        
        return SubAdminResponse(**{**user, "permissions": permissions})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sub-admin: {str(e)}"
        )


@router.delete("/{subadmin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subadmin(
    subadmin_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Delete sub-admin account
    
    - Super Admin only
    - Soft delete (sets deleted_at timestamp)
    """
    try:
        # Check if sub-admin exists
        user_query = supabase.table("users").select("*").eq("id", str(subadmin_id)).eq(
            "role", "subadmin"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sub-admin not found"
            )
        
        # Soft delete
        supabase.table("users").update({
            "deleted_at": datetime.utcnow().isoformat(),
            "is_active": False
        }).eq("id", str(subadmin_id)).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sub-admin: {str(e)}"
        )


@router.put("/{subadmin_id}/permissions", response_model=SubAdminResponse)
async def update_subadmin_permissions(
    subadmin_id: UUID,
    permissions_data: PermissionsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Update sub-admin permissions only
    
    - Super Admin only
    - Updates permissions array
    """
    try:
        # Check if sub-admin exists
        user_query = supabase.table("users").select("*").eq("id", str(subadmin_id)).eq(
            "role", "subadmin"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sub-admin not found"
            )
        
        user = user_query.data[0]
        
        # Update permissions
        perm_update = {
            "permissions": permissions_data.permissions,
            "updated_by": current_user["user_id"],
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if permissions record exists
        perm_query = supabase.table("admin_permissions").select("*").eq(
            "user_id", str(subadmin_id)
        ).execute()
        
        if perm_query.data:
            # Update existing
            supabase.table("admin_permissions").update(perm_update).eq(
                "user_id", str(subadmin_id)
            ).execute()
        else:
            # Create new
            perm_update["user_id"] = str(subadmin_id)
            perm_update["created_by"] = current_user["user_id"]
            supabase.table("admin_permissions").insert(perm_update).execute()
        
        return SubAdminResponse(**{**user, "permissions": permissions_data.permissions})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update permissions: {str(e)}"
        )
