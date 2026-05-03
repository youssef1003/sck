# Phase 5: Admin Dashboard Pages - Implementation Status

**Date:** May 2, 2026  
**Status:** ⏳ IN PROGRESS

---

## ✅ COMPLETED ADMIN PAGES (2/7)

### A) Admin Services Management ✅
**File:** `frontend/src/pages/admin/ServicesManagementNew.jsx`  
**Status:** ✅ COMPLETE  
**Features Implemented:**
- ✅ List services from Supabase (`/api/admin?action=services`)
- ✅ Create service (POST)
- ✅ Edit service (PUT)
- ✅ Activate/deactivate (toggle is_active)
- ✅ Soft delete (DELETE)
- ✅ Reorder services (sort_order field)
- ✅ Edit deliverables as repeatable fields
- ✅ Edit stages as repeatable fields
- ✅ NO localStorage usage
- ✅ Uses real backend API

**Permissions Required:**
- services_view
- services_create
- services_edit
- services_delete

### B) Admin Packages Management ✅
**File:** `frontend/src/pages/admin/PackagesManagement.jsx`  
**Status:** ✅ COMPLETE  
**Features Implemented:**
- ✅ List packages from Supabase (`/api/admin?action=packages`)
- ✅ Create package (POST)
- ✅ Edit package (PUT)
- ✅ Activate/deactivate (toggle is_active)
- ✅ Soft delete (DELETE)
- ✅ Reorder packages (sort_order field)
- ✅ Edit features as repeatable fields
- ✅ NO localStorage usage
- ✅ Uses real backend API

**Permissions Required:**
- packages_view
- packages_create
- packages_edit
- packages_delete

---

## ⏳ REMAINING ADMIN PAGES (5/7)

### C) Admin Quote Requests Management ⏳
**File:** `frontend/src/pages/admin/QuoteRequestsManagement.jsx`  
**Status:** ⏳ NOT CREATED YET  
**Required Features:**
- List quote requests from Supabase
- Search/filter by status, package, company size, date
- View full request details
- Update status (new, reviewing, quoted, contacted, closed, rejected)
- Assign to admin/subadmin
- Add internal admin notes
- Export CSV
- Soft delete
- NO localStorage usage

**Permissions:**
- quote_requests_view
- quote_requests_edit
- quote_requests_delete
- quote_requests_export

### D) Admin Candidates Management ⏳
**File:** `frontend/src/pages/admin/CandidatesManagement.jsx`  
**Status:** ⏳ NOT CREATED YET  
**Required Features:**
- List candidates from Supabase
- Search/filter by job title, sector, city, experience, verification status, premium badge
- View candidate details
- Update candidate
- Set verification_status (pending/scq_verified/rejected)
- Toggle premium_badge
- Add admin notes
- Hide/unhide candidate
- Soft delete
- Export CSV
- **CRITICAL:** Contact info masking enforced by backend
  - If user lacks `candidates_view_contact_info` permission:
    - full_name: محجوب
    - national_id: محجوب
    - mobile: محجوب
    - email: محجوب
- NO localStorage usage

**Permissions:**
- candidates_view
- candidates_edit
- candidates_verify
- candidates_delete
- candidates_export
- candidates_view_contact_info (for unmasking)

### E) Admin Subadmins Management ⏳
**File:** `frontend/src/pages/admin/SubadminsManagementNew.jsx`  
**Status:** ⏳ NOT CREATED YET  
**Purpose:** REPLACE the current localStorage implementation  
**Required Features:**
- List subadmins from Supabase (`/api/admin?action=subadmins`)
- Create subadmin (uses `create_user_with_password` function)
- Edit subadmin
- Activate/deactivate
- Soft delete
- Assign permissions using grouped checkboxes
- Prevent subadmin from managing super admin/admin
- Prevent subadmin from granting permissions they don't have
- NO localStorage usage
- MUST replace `frontend/src/pages/admin/SubAdminsManagement.jsx`

**Permissions:**
- subadmins_view
- subadmins_create
- subadmins_edit
- subadmins_delete
- subadmins_manage_permissions

### F) Admin Home Content Editor ⏳
**File:** `frontend/src/pages/admin/HomeContentEditor.jsx`  
**Status:** ⏳ NOT CREATED YET  
**Required Features:**
- Edit home_quality_consulting
- Edit home_integrated_hr_solutions
- Edit services_intro
- Edit recruitment_intro
- All stored in Supabase `page_content` table
- Uses `/api/admin?action=page-content` endpoint
- NO localStorage usage

**Permissions:**
- content_view
- content_edit

### G) Admin Audit Logs ⏳
**File:** `frontend/src/pages/admin/AuditLogs.jsx`  
**Status:** ⏳ NOT CREATED YET  
**Required Features:**
- List admin audit logs from Supabase
- Filter by actor, action, resource_type, date
- Read-only page (no create/edit/delete)
- Display: timestamp, actor, action, resource, metadata
- Uses `/api/admin?action=audit-logs` endpoint
- NO localStorage usage

**Permissions:**
- audit_logs_view

---

## 🔄 ROUTING AND SIDEBAR (Not Done)

### H) Update Admin Navigation ⏳
**Files to Update:**
- Admin layout/sidebar component
- Admin routes in `App.jsx`

**Required Navigation Items:**
- Dashboard (existing)
- **Services** (new)
- **Packages** (new)
- **Quote Requests** (new)
- **Candidates** (new)
- **Subadmins** (new - replace old)
- **Home Content** (new)
- **Audit Logs** (new)
- Users (existing)
- Bookings (existing)
- Messages (existing)
- Blog (existing)

**Permission-Based Display:**
- Only show nav items the logged-in admin/subadmin has permission to access
- Check permissions from user_data in localStorage (set during login)

---

## 📝 API CLIENT UPDATES (Not Done)

### I) Update Admin API Utilities ⏳
**File:** `frontend/src/utils/apiClient.js`

**Required Updates:**
Add admin API methods for:
```javascript
adminAPI: {
  // Services (already exists in backend)
  services: {
    getAll: async () => axios.get('/api/admin?action=services'),
    create: async (data) => axios.post('/api/admin?action=services', data),
    update: async (id, data) => axios.put(`/api/admin?action=services&id=${id}`, data),
    delete: async (id) => axios.delete(`/api/admin?action=services&id=${id}`)
  },
  
  // Packages (already exists in backend)
  packages: {
    getAll: async () => axios.get('/api/admin?action=packages'),
    create: async (data) => axios.post('/api/admin?action=packages', data),
    update: async (id, data) => axios.put(`/api/admin?action=packages&id=${id}`, data),
    delete: async (id) => axios.delete(`/api/admin?action=packages&id=${id}`)
  },
  
  // Quote Requests (already exists in backend)
  quoteRequests: {
    getAll: async (params) => axios.get('/api/admin?action=quote-requests', { params }),
    update: async (id, data) => axios.put(`/api/admin?action=quote-requests&id=${id}`, data),
    delete: async (id) => axios.delete(`/api/admin?action=quote-requests&id=${id}`)
  },
  
  // Candidates (already exists in backend)
  candidates: {
    getAll: async (params) => axios.get('/api/admin?action=candidates', { params }),
    update: async (id, data) => axios.put(`/api/admin?action=candidates&id=${id}`, data),
    delete: async (id) => axios.delete(`/api/admin?action=candidates&id=${id}`)
  },
  
  // Subadmins (already exists in backend)
  subadmins: {
    getAll: async () => axios.get('/api/admin?action=subadmins'),
    create: async (data) => axios.post('/api/admin?action=subadmins', data),
    update: async (id, data) => axios.put(`/api/admin?action=subadmins&id=${id}`, data),
    delete: async (id) => axios.delete(`/api/admin?action=subadmins&id=${id}`)
  },
  
  // Audit Logs (already exists in backend)
  auditLogs: {
    getAll: async (params) => axios.get('/api/admin?action=audit-logs', { params })
  },
  
  // Page Content (already exists in backend)
  pageContent: {
    get: async (pageKey) => axios.get(`/api/admin?action=page-content&page_key=${pageKey}`),
    save: async (pageKey, content) => axios.post('/api/admin?action=page-content', { page_key: pageKey, content })
  }
}
```

---

## ❌ LOCALSTORAGE BLOCKERS STATUS

### Files Still Using localStorage for Business Data:

1. ❌ **Contact.jsx** - Contact submissions
2. ❌ **Careers.jsx** - Career applications (marked "temporary")
3. ❌ **Register.jsx** - User registrations
4. ❌ **Dashboard.jsx** - User profile updates
5. ❌ **admin/CareersManagement.jsx** - Career applications (marked "temporary")
6. ❌ **admin/ContactManagement.jsx** - Contact management
7. ❌ **admin/ContactsManagement.jsx** - Contact management
8. ❌ **admin/EmployersManagement.jsx** - Employer management
9. ❌ **admin/HomeEditor.jsx** - Home content edits
10. ❌ **admin/ServicesManagement.jsx** - Services management (OLD VERSION - will be replaced)
11. ❌ **admin/SubAdminsManagement.jsx** - Subadmin management (OLD VERSION - will be replaced)

**Fixed So Far:** 0/11  
**Remaining:** 11/11

---

## 🎯 NEXT STEPS

### Immediate Actions Required:

1. **Create remaining 5 admin pages:**
   - QuoteRequestsManagement.jsx
   - CandidatesManagement.jsx
   - SubadminsManagementNew.jsx (to replace old one)
   - HomeContentEditor.jsx
   - AuditLogs.jsx

2. **Update routing:**
   - Add routes in App.jsx
   - Update admin sidebar/navigation
   - Implement permission-based nav display

3. **Update API client:**
   - Add helper methods for all admin endpoints

4. **Replace old localStorage pages:**
   - Replace admin/ServicesManagement.jsx with ServicesManagementNew.jsx
   - Replace admin/SubAdminsManagement.jsx with SubadminsManagementNew.jsx

5. **Fix remaining localStorage blockers:**
   - Contact.jsx
   - Careers.jsx
   - Register.jsx
   - Dashboard.jsx
   - admin/CareersManagement.jsx
   - admin/ContactManagement.jsx
   - admin/ContactsManagement.jsx
   - admin/EmployersManagement.jsx
   - admin/HomeEditor.jsx

6. **Run build test:**
   - Verify all pages compile
   - Check for errors

7. **Upgrade CandidateRegister.jsx:**
   - Convert from simple form to professional 7-step wizard

---

## ⚠️ CRITICAL REMINDERS

- ❌ **DO NOT** mark project as production-ready while 11 localStorage blockers exist
- ❌ **DO NOT** start deployment yet
- ✅ **DO** use real backend APIs for all admin pages
- ✅ **DO** enforce candidate contact masking via backend
- ✅ **DO** keep build passing after every change
- ✅ **DO** replace old localStorage admin pages with Supabase-backed versions

---

**Last Updated:** May 2, 2026  
**Completion:** 2/7 admin pages (28.6%)  
**localStorage Blockers Fixed:** 0/11 (0%)  
**Production Ready:** ❌ NO
