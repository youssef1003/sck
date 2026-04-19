"""
Authentication Routes
Handles login, registration, token refresh, and password management
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid

from models.schemas import (
    UserLogin, 
    UserRegister, 
    TokenResponse, 
    RefreshTokenRequest,
    PasswordChange,
    UserResponse
)
from services.auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    decode_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from services.supabase_client import supabase

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user
    
    - Creates a new user account
    - Returns JWT tokens
    - For employers, creates pending approval record
    """
    try:
        # Check if user already exists
        existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Create user
        user_insert = {
            "email": user_data.email,
            "password_hash": password_hash,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "company": user_data.company,
            "role": user_data.role if user_data.role in ["client", "employer"] else "client",
            "is_active": True,
            "metadata": {}
        }
        
        # For employers, set approval status
        if user_data.role == "employer":
            user_insert["is_approved"] = False
            user_insert["approval_status"] = "pending"
        
        result = supabase.table("users").insert(user_insert).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = result.data[0]
        
        # Create employer approval record if employer
        if user_data.role == "employer":
            supabase.table("employer_approvals").insert({
                "user_id": user["id"],
                "status": "pending"
            }).execute()
        
        # Create tokens
        token_data = {
            "user_id": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "permissions": []
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token({"user_id": str(user["id"])})
        
        # Update last login
        supabase.table("users").update({
            "last_login_at": datetime.utcnow().isoformat()
        }).eq("id", user["id"]).execute()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user["id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "is_approved": user.get("is_approved"),
                "permissions": []
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login user
    
    - Accepts email or username
    - Returns JWT tokens with user data and permissions
    - Updates last login timestamp
    """
    try:
        # Try to find user by email or username
        user_query = supabase.table("users").select("*").or_(
            f"email.eq.{credentials.email},metadata->>username.eq.{credentials.email}"
        ).eq("deleted_at", None).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        user = user_query.data[0]
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Get permissions for sub-admins
        permissions = []
        if user["role"] == "subadmin":
            perm_query = supabase.table("admin_permissions").select("permissions").eq(
                "user_id", user["id"]
            ).execute()
            
            if perm_query.data:
                permissions = perm_query.data[0].get("permissions", [])
        
        # Create tokens
        token_data = {
            "user_id": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "permissions": permissions
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token({"user_id": str(user["id"])})
        
        # Update last login
        supabase.table("users").update({
            "last_login_at": datetime.utcnow().isoformat()
        }).eq("id", user["id"]).execute()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user["id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "is_approved": user.get("is_approved"),
                "permissions": permissions
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    
    - Validates refresh token
    - Issues new access and refresh tokens
    """
    try:
        # Decode refresh token
        payload = decode_token(token_request.refresh_token)
        
        # Verify token type
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user data
        user_query = supabase.table("users").select("*").eq("id", user_id).eq(
            "deleted_at", None
        ).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user = user_query.data[0]
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Get permissions for sub-admins
        permissions = []
        if user["role"] == "subadmin":
            perm_query = supabase.table("admin_permissions").select("permissions").eq(
                "user_id", user["id"]
            ).execute()
            
            if perm_query.data:
                permissions = perm_query.data[0].get("permissions", [])
        
        # Create new tokens
        token_data = {
            "user_id": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "permissions": permissions
        }
        
        access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token({"user_id": str(user["id"])})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user["id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "is_approved": user.get("is_approved"),
                "permissions": permissions
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current user information
    
    - Returns full user profile
    - Requires valid JWT token
    """
    try:
        user_id = current_user["user_id"]
        
        user_query = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_query.data[0]
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Change user password
    
    - Requires old password verification
    - Updates password hash
    """
    try:
        user_id = current_user["user_id"]
        
        # Get current user
        user_query = supabase.table("users").select("password_hash").eq("id", user_id).execute()
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_query.data[0]
        
        # Verify old password
        if not verify_password(password_data.old_password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect old password"
            )
        
        # Hash new password
        new_password_hash = hash_password(password_data.new_password)
        
        # Update password
        supabase.table("users").update({
            "password_hash": new_password_hash,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user_id).execute()
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )


@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Logout user
    
    - In a production system, this would invalidate the token
    - For now, client should delete the token
    """
    return {"message": "Logged out successfully"}
