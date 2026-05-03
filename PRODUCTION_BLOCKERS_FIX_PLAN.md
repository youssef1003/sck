# Production Blockers - Comprehensive Fix Plan

**Date**: May 3, 2026  
**Status**: IN PROGRESS  
**Priority**: CRITICAL - Must fix before migration

---

## BLOCKERS TO FIX

### 1. ✅ Replace Migration File with Complete Schema
- **File**: `supabase/migrations/20260503_complete_production_schema.sql`
- **Add**: RAG tables (rag_documents, chat_conversations, chat_messages, rag_ingestion_jobs)
- **Add**: Storage buckets setup
- **Keep**: All existing 13 tables + functions
- **Status**: PENDING

### 2. ✅ Fix Super Admin Role Support
- **Files**:
  - `frontend/src/pages/auth/Login.jsx` - Accept both "super_admin" and "admin"
  - `frontend/src/components/admin/AdminRoute.jsx` - Check both roles
  - `frontend/src/utils/permissions.js` - Update isSuperAdmin() and hasPermission()
  - `frontend/src/components/admin/AdminLayout.jsx` - Update role checks
- **Rules**:
  - Both "super_admin" and "admin" access admin dashboard
  - super_admin bypasses all permission checks
  - hasPermission() returns true if permissions includes "*"
  - isSuperAdmin() returns true for "super_admin" OR "admin"
- **Status**: PENDING

### 3. ✅ Fix Auth Response Permissions
- **File**: `api/auth.js`
- **Fix**:
  - Login response must include `permissions` field
  - `/api/auth?action=me` must include `permissions` field
  - Refresh flow must keep role correct
- **Frontend localStorage must store**:
  - id, email, full_name, role, **permissions**, is_active
- **Status**: PENDING

### 4. ✅ Update Permissions List
- **File**: `frontend/src/utils/permissions.js`
- **Add Missing Permissions**:
  ```javascript
  services_view, services_create, services_edit, services_delete
  packages_view, packages_create, packages_edit, packages_delete
  quote_requests_view, quote_requests_edit, quote_requests_delete, quote_requests_export
  candidates_view, candidates_edit, candidates_verify, candidates_delete, candidates_export, candidates_view_contact_info
  content_view, content_edit
  audit_logs_view
  rag_ingest
  upload_files
  ```
- **Add to**: PERMISSIONS object and PERMISSION_GROUPS
- **Status**: PENDING

### 5. ✅ Fix Admin Pages Authorization Headers
- **Files**:
  - `frontend/src/pages/admin/ServicesManagementNew.jsx`
  - `frontend/src/pages/admin/PackagesManagement.jsx`
  - `frontend/src/pages/admin/QuoteRequestsManagement.jsx`
  - `frontend/src/pages/admin/CandidatesManagement.jsx`
  - `frontend/src/pages/admin/SubAdminsManagementNew.jsx`
  - `frontend/src/pages/admin/HomeContentEditor.jsx`
  - `frontend/src/pages/admin/AuditLogs.jsx`
  - `frontend/src/pages/admin/ContactsManagement.jsx`
- **Fix**: Use `Authorization: Bearer ${localStorage.getItem('access_token')}`
- **Best Solution**: Create/use `frontend/src/utils/adminApi.js` properly
- **Status**: PENDING

### 6. ✅ Fix Request ID Handling Mismatch
- **Problem**: Frontend sends `id` in query, backend expects in body
- **Solution**: Standardize to body for PUT/DELETE
  - PUT body: `{ id, ...updates }`
  - DELETE body: `{ id }`
- **Update**: All frontend admin pages
- **Status**: PENDING

### 7. ✅ Add Contact Requests Admin Handler
- **File**: `api/admin.js`
- **Add**: `case 'contact-requests': return await handleContactRequests(req, res, admin)`
- **Implement**:
  - GET `/api/admin?action=contact-requests` (permission: contact_requests_view)
  - PUT `/api/admin?action=contact-requests` (permission: contact_requests_edit)
  - DELETE `/api/admin?action=contact-requests` (permission: contact_requests_delete)
- **Features**: list, filter, update status/notes, soft delete, audit logs
- **Status**: PENDING

### 8. ✅ Fix Audit Logs Permission Mismatch
- **Problem**: Frontend uses `audit_logs_view`, backend checks `analytics_view`
- **Fix**: Change backend to check `audit_logs_view`
- **File**: `api/admin.js`
- **Status**: PENDING

### 9. ✅ Fix BookingModal API Endpoint
- **File**: `frontend/src/components/BookingModal.jsx`
- **Fix**: Submit to `/api/bookings` (not `/api/consultation`)
- **Map Fields**: Ensure compatibility with `consultation_bookings` table
  - service_type ↔ serviceType
  - preferred_date ↔ preferredDate
  - preferred_time ↔ preferredTime
  - notes/message consistency
- **Status**: PENDING

### 10. ✅ Fix Candidates API Server Validation
- **File**: `api/candidates.js`
- **Add Validation**: Require all mandatory fields from 7-step form
  - full_name, national_id, mobile, email (already required)
  - nationality, gender, city, education_level, functional_sector (add validation)
- **Block Public Fields**: verification_status, premium_badge, admin_notes
- **Status**: PENDING

### 11. ✅ Fix RAG Production Safety
- **File**: `api/rag.js`
- **Remove Fallback**: `HF_API_KEY || 'hf_demo'`
- **If Missing HF_API_KEY**:
  - Chat: Return safe unavailable/fallback response
  - Ingest: Do not run, return error
  - No fake key
- **Reduce Logging**: No full user messages, no sensitive data
- **Status**: PENDING

### 12. ✅ Fix Deferred Routes
- **Routes to Fix**:
  - `/employer/dashboard` - Should not use localStorage business data
  - Old localStorage admin pages - Should not be routed
- **Solution**: Redirect or show "Coming Soon" for deferred features
- **Status**: PENDING

### 13. ✅ Fix adminApi.js Old Manage Usage
- **File**: `frontend/src/utils/adminApi.js`
- **Remove**: `?action=manage` (removed from backend)
- **Replace With Explicit Endpoints**:
  - `?action=users`
  - `?action=contact-requests`
  - `?action=page-content`
  - `?action=blog`
  - `?action=services`
  - `?action=packages`
  - `?action=quote-requests`
  - `?action=candidates`
  - `?action=subadmins`
  - `?action=audit-logs`
- **Status**: PENDING

---

## EXECUTION ORDER

1. **Migration File** (Foundation)
2. **Auth & Permissions** (Core Security)
3. **Backend API Fixes** (Server-side)
4. **Frontend Utils** (Shared Logic)
5. **Admin Pages** (UI)
6. **Build & Test** (Verification)

---

## FILES TO MODIFY

### Backend (API):
1. `supabase/migrations/20260503_complete_production_schema.sql` - NEW
2. `api/auth.js` - Add permissions to responses
3. `api/admin.js` - Add contact-requests handler, fix audit logs permission
4. `api/candidates.js` - Add server validation
5. `api/rag.js` - Remove fallback, add safety
6. `api/bookings.js` - Verify field mapping

### Frontend (Utils):
7. `frontend/src/utils/permissions.js` - Add missing permissions, fix isSuperAdmin()
8. `frontend/src/utils/adminApi.js` - Remove manage, add explicit endpoints

### Frontend (Auth):
9. `frontend/src/pages/auth/Login.jsx` - Store permissions in localStorage
10. `frontend/src/components/admin/AdminRoute.jsx` - Check both roles
11. `frontend/src/components/admin/AdminLayout.jsx` - Update role checks

### Frontend (Admin Pages):
12. `frontend/src/pages/admin/ServicesManagementNew.jsx` - Use adminApi, fix ID handling
13. `frontend/src/pages/admin/PackagesManagement.jsx` - Use adminApi, fix ID handling
14. `frontend/src/pages/admin/QuoteRequestsManagement.jsx` - Use adminApi, fix ID handling
15. `frontend/src/pages/admin/CandidatesManagement.jsx` - Use adminApi, fix ID handling
16. `frontend/src/pages/admin/SubAdminsManagementNew.jsx` - Use adminApi, fix ID handling
17. `frontend/src/pages/admin/HomeContentEditor.jsx` - Use adminApi
18. `frontend/src/pages/admin/AuditLogs.jsx` - Use adminApi
19. `frontend/src/pages/admin/ContactsManagement.jsx` - Use adminApi

### Frontend (Other):
20. `frontend/src/components/BookingModal.jsx` - Fix endpoint and field mapping

---

## VERIFICATION CHECKLIST

After all fixes:
- [ ] Migration file is complete (17 tables: 13 existing + 4 RAG)
- [ ] Super admin login works with both "super_admin" and "admin" roles
- [ ] Permissions are returned in login/me responses
- [ ] Permissions are stored in localStorage
- [ ] All admin pages send Authorization header
- [ ] Contact requests admin handler works
- [ ] BookingModal uses /api/bookings
- [ ] Candidates server validation is complete
- [ ] RAG fallback is production-safe
- [ ] Build passes: `cd frontend && npm run build`
- [ ] No remaining blockers

---

**Status**: Ready to execute fixes
**Next**: Start with migration file creation
