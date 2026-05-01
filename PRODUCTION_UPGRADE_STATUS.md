# SCQ GROUP Production Upgrade Status

**Branch:** `production-scq-recruitment-system`  
**Date Started:** May 1, 2026  
**Current Phase:** Phase 1 Complete ✅

---

## ✅ Phase 1: Production Security Hardening (COMPLETE)

### A) JWT Security Fixed
- ✅ Removed JWT_SECRET fallback from `api/auth.js`
- ✅ Removed JWT_SECRET fallback from `api/admin.js`
- ✅ Removed JWT_SECRET fallback from `api/upload.js`
- ✅ Added configuration error responses when JWT_SECRET missing
- ✅ Removed sensitive logging (passwords, tokens, user objects)
- ✅ Sanitized error messages for production

### B) Admin/Subadmin Backend Authorization
- ✅ Created `verifyAuth(req)` helper function
- ✅ Created `hasPermission(userId, permission)` helper
- ✅ Created `requireAdminOrPermission(req, permission)` helper
- ✅ Implemented permission checks in all admin handlers:
  - ✅ `handleStats` - requires `analytics_view` for subadmins
  - ✅ `handleUsers` - requires `users_view/create/edit/delete`
  - ✅ `handleBlog` - requires `blog_view/create/edit/publish/delete`
  - ✅ `handlePageContent` - requires `home_edit`
  - ✅ `handleBackup` - super admin only
- ✅ Backend now reads permissions from `users.permissions` JSONB column

### C) Dangerous Endpoints Protected
- ✅ `api/test.js` - requires `x-debug-secret` header if `DEBUG_SECRET` env var set
- ✅ `api/test-db.js` - requires `x-debug-secret` header if `DEBUG_SECRET` env var set
- ✅ `api/rag.js?action=ingest` - requires authentication + `rag_ingest` permission
- ✅ `api/upload.js` - requires authentication for all uploads

### D) Unsafe Generic Table Management Removed
- ✅ Removed `handleManage()` function from `api/admin.js`
- ✅ No more arbitrary `supabase.from(table)` from client input
- ✅ All table access now through explicit, permission-checked handlers

### E) Environment Variables Required
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-strong-secret-key
DEBUG_SECRET=your-debug-secret (optional, for test endpoints)
```

---

## ✅ Phase 2: Database Migration (COMPLETE)

### Migration File Created
- ✅ `supabase/migrations/20260501_scq_recruitment_content_system.sql`

### Tables Created

#### 1. service_pages
- ✅ Stores service details pages (8 services seeded)
- ✅ Fields: slug, title_ar/en, details, deliverables, stages, why_scq, icon, etc.
- ✅ Soft delete support
- ✅ Sort order and active status

#### 2. recruitment_packages
- ✅ Stores recruitment packages (4 packages seeded: Bronze, Silver, Gold, Platinum)
- ✅ Fields: slug, name, tier, cv_count, is_scq_verified, features, etc.
- ✅ Soft delete support

#### 3. quote_requests
- ✅ Stores quote requests from companies
- ✅ Fields: company info, representative, vacancy details, challenges, status
- ✅ Status workflow: new → reviewing → quoted → contacted → closed/rejected
- ✅ Can be assigned to admin/subadmin

#### 4. candidate_profiles
- ✅ Stores candidate registrations
- ✅ **SENSITIVE FIELDS** (admin-only): full_name, national_id, mobile, email
- ✅ Auto-generated candidate_code (SCQ-CAN-000001)
- ✅ Verification status: pending → scq_verified / rejected
- ✅ Premium badge support
- ✅ Soft delete support

#### 5. candidate_experiences
- ✅ Stores up to 4 previous work experiences per candidate
- ✅ Cascade delete with candidate

#### 6. candidate_languages
- ✅ Stores up to 3 languages per candidate
- ✅ Cascade delete with candidate

#### 7. candidate_computer_skills
- ✅ Stores computer skills (Excel, Word, PowerPoint, etc.)
- ✅ Cascade delete with candidate

#### 8. admin_audit_logs
- ✅ Tracks all admin actions
- ✅ Fields: actor, action, resource_type, resource_id, metadata, ip_address

#### 9. users table updated
- ✅ Added `permissions` JSONB column if not exists

#### 10. page_content seeded
- ✅ home_quality_consulting
- ✅ home_integrated_hr_solutions
- ✅ services_intro
- ✅ recruitment_intro

---

## 🚧 Phase 3: New Backend APIs (TODO)

### Public APIs to Create
- ⏳ `POST /api/quote-requests` - Submit quote request
- ⏳ `POST /api/candidates` - Submit candidate registration
- ⏳ `GET /api/services` - List all active services
- ⏳ `GET /api/services?slug=...` - Get service by slug
- ⏳ `GET /api/recruitment-packages` - List all active packages

### Admin APIs to Create
- ⏳ `GET /api/admin?action=services` - List services
- ⏳ `POST /api/admin?action=services` - Create service
- ⏳ `PUT /api/admin?action=services` - Update service
- ⏳ `DELETE /api/admin?action=services` - Delete service
- ⏳ `GET /api/admin?action=packages` - List packages
- ⏳ `POST /api/admin?action=packages` - Create package
- ⏳ `PUT /api/admin?action=packages` - Update package
- ⏳ `DELETE /api/admin?action=packages` - Delete package
- ⏳ `GET /api/admin?action=quote-requests` - List quote requests
- ⏳ `PUT /api/admin?action=quote-requests` - Update quote request
- ⏳ `DELETE /api/admin?action=quote-requests` - Delete quote request
- ⏳ `GET /api/admin?action=candidates` - List candidates (sanitized for non-privileged)
- ⏳ `PUT /api/admin?action=candidates` - Update candidate
- ⏳ `DELETE /api/admin?action=candidates` - Delete candidate
- ⏳ `GET /api/admin?action=subadmins` - List subadmins
- ⏳ `POST /api/admin?action=subadmins` - Create subadmin
- ⏳ `PUT /api/admin?action=subadmins` - Update subadmin
- ⏳ `DELETE /api/admin?action=subadmins` - Delete subadmin
- ⏳ `GET /api/admin?action=audit-logs` - List audit logs

---

## 🚧 Phase 4: Public Pages (TODO)

### A) Home Page Updates
- ⏳ Add "أنظمة الجودة والاستشارات" section
- ⏳ Add "الحلول المتكاملة للموارد البشرية" section with 8 service cards
- ⏳ Make content editable from admin dashboard

### B) Services Page
- ⏳ Replace static services with dynamic data from `/api/services`
- ⏳ Create `/services/:slug` route for service details
- ⏳ Show: hero, details, deliverables, stages, why SCQ, CTA
- ⏳ Add special buttons for recruitment service

### C) Recruitment Packages Page
- ⏳ Create `/recruitment-packages` route
- ⏳ Display 4 package cards (Bronze, Silver, Gold, Platinum)
- ⏳ Show: CV count, verification status, scope, duration, features, compatibility
- ⏳ Add "SCQ Verified" badge for Gold/Platinum
- ⏳ CTA buttons: "تسجيل الدخول" and "طلب عرض سعر"

### D) Quote Request Page
- ⏳ Create `/quote-request` route
- ⏳ Build multi-section form:
  - Representative info (name, role)
  - Company info (name, size, activity)
  - Vacancy info (nature, challenges, employees needed, professions)
  - Package selection
  - Contact info (mobile, email)
- ⏳ Form validation with required fields
- ⏳ Success message after submission

### E) Candidate Registration Page
- ⏳ Create `/candidate/register` route
- ⏳ Build 7-step form:
  1. Contact info (name, national_id, mobile, email) - with privacy notice
  2. Basic info (nationality, gender, age, marital status, location, etc.)
  3. Legal status (military, court judgments, criminal record, insurance, labor cases)
  4. Education (level, specialization, sector, job title, experience years)
  5. Work experiences (up to 4 companies)
  6. Skills (languages up to 3, computer skills)
  7. Salary (current, expected)
- ⏳ Auto-generate candidate_code on backend
- ⏳ Success message after submission

---

## 🚧 Phase 5: Admin Dashboard Pages (TODO)

### A) Services Management (`/admin/services`)
- ⏳ List all services
- ⏳ Create/edit/delete service
- ⏳ Reorder services
- ⏳ Activate/deactivate service
- ⏳ Edit deliverables and stages as repeatable fields
- ⏳ Permissions: `services_view`, `services_create`, `services_edit`, `services_delete`

### B) Packages Management (`/admin/packages`)
- ⏳ List all packages
- ⏳ Create/edit/delete package
- ⏳ Reorder packages
- ⏳ Activate/deactivate package
- ⏳ Permissions: `packages_view`, `packages_create`, `packages_edit`, `packages_delete`

### C) Quote Requests Management (`/admin/quote-requests`)
- ⏳ List all quote requests
- ⏳ Search/filter by status, package, company size, date
- ⏳ View request details
- ⏳ Update status
- ⏳ Assign to admin/subadmin
- ⏳ Add internal notes
- ⏳ Export CSV
- ⏳ Soft delete
- ⏳ Permissions: `quote_requests_view`, `quote_requests_edit`, `quote_requests_delete`, `quote_requests_export`

### D) Candidates Management (`/admin/candidates`)
- ⏳ List all candidates
- ⏳ Search/filter by job title, sector, city, experience, verification status, premium badge
- ⏳ View candidate details
- ⏳ **IMPORTANT:** Mask contact info for users without `candidates_view_contact_info` permission
- ⏳ Update candidate
- ⏳ Set verification status (Pending / SCQ Verified / Rejected)
- ⏳ Toggle Premium Badge
- ⏳ Add admin notes
- ⏳ Hide/unhide candidate
- ⏳ Soft delete
- ⏳ Export CSV
- ⏳ Permissions: `candidates_view`, `candidates_edit`, `candidates_verify`, `candidates_delete`, `candidates_export`, `candidates_view_contact_info`

### E) Subadmins Management (`/admin/subadmins`)
- ⏳ Replace localStorage implementation with Supabase
- ⏳ List all subadmins
- ⏳ Create/edit/delete subadmin
- ⏳ Activate/deactivate subadmin
- ⏳ Reset password or set temporary password
- ⏳ Assign permissions using grouped checkboxes
- ⏳ **RULE:** Subadmin cannot manage super admin
- ⏳ **RULE:** Subadmin cannot grant permissions they don't have
- ⏳ Permissions: `subadmins_view`, `subadmins_create`, `subadmins_edit`, `subadmins_delete`, `subadmins_manage_permissions`

### F) Home Content Editor (`/admin/home-content`)
- ⏳ Edit home_quality_consulting
- ⏳ Edit home_integrated_hr_solutions
- ⏳ Edit services_intro
- ⏳ Edit recruitment_intro
- ⏳ Permission: `home_edit`

### G) Audit Logs (`/admin/audit-logs`)
- ⏳ List all admin actions
- ⏳ Filter by actor, action, resource type, date range
- ⏳ View action details
- ⏳ Permission: `analytics_view`

---

## 📋 Permissions System

### Implemented Permissions
```javascript
// Users Management
users_view
users_create
users_edit
users_delete
users_change_role

// Bookings Management
bookings_view
bookings_edit
bookings_delete
bookings_change_status

// Messages Management
messages_view
messages_edit
messages_delete
messages_change_status

// Blog Management
blog_view
blog_create
blog_edit
blog_delete
blog_publish

// Services Management (NEW)
services_view
services_create
services_edit
services_delete

// Packages Management (NEW)
packages_view
packages_create
packages_edit
packages_delete

// Quote Requests Management (NEW)
quote_requests_view
quote_requests_edit
quote_requests_delete
quote_requests_export

// Candidates Management (NEW)
candidates_view
candidates_edit
candidates_verify
candidates_delete
candidates_export
candidates_view_contact_info  // SENSITIVE

// Subadmins Management
subadmins_view
subadmins_create
subadmins_edit
subadmins_delete
subadmins_manage_permissions

// Content Management
home_edit

// Analytics
analytics_view
reports_export

// RAG Management
rag_ingest
```

---

## 🔒 Security Checklist

- ✅ No JWT_SECRET fallback
- ✅ No hardcoded passwords or API keys
- ✅ No sensitive data in logs
- ✅ Backend permission checks for all admin actions
- ✅ No arbitrary table access from client input
- ✅ Test endpoints protected with DEBUG_SECRET
- ✅ RAG ingestion requires authentication
- ✅ File uploads require authentication
- ✅ Candidate contact info protected (admin-only with specific permission)
- ⏳ RLS enabled on sensitive tables (optional, APIs use service role)
- ⏳ Audit logging for all admin actions

---

## 🧪 Testing Checklist (TODO)

### Build & Run
- ⏳ `npm install` in frontend
- ⏳ `npm run build` in frontend
- ⏳ `vercel dev` (if possible)

### Public Pages
- ⏳ `/` - Home page with new sections
- ⏳ `/services` - Dynamic services list
- ⏳ `/services/recruitment` - Recruitment service details
- ⏳ `/recruitment-packages` - Packages page
- ⏳ `/quote-request` - Quote request form
- ⏳ `/candidate/register` - Candidate registration form

### Authentication
- ⏳ `/login` - Login page
- ⏳ Test login with admin@sck.com
- ⏳ Test login with subadmin account

### Admin Dashboard
- ⏳ `/admin/dashboard` - Dashboard with stats
- ⏳ `/admin/services` - Services management
- ⏳ `/admin/packages` - Packages management
- ⏳ `/admin/quote-requests` - Quote requests management
- ⏳ `/admin/candidates` - Candidates management
- ⏳ `/admin/subadmins` - Subadmins management
- ⏳ `/admin/home-content` - Home content editor
- ⏳ `/admin/audit-logs` - Audit logs

### Forms
- ⏳ Submit quote request
- ⏳ Submit candidate registration
- ⏳ View requests in admin
- ⏳ Change candidate to SCQ Verified
- ⏳ Toggle Premium Badge

### Permissions
- ⏳ Create subadmin with limited permissions
- ⏳ Login as subadmin
- ⏳ Verify subadmin cannot access unauthorized pages
- ⏳ Verify backend rejects unauthorized API calls
- ⏳ Verify contact info masking for candidates

---

## 📦 Files Changed (Phase 1)

### Modified
- `api/auth.js` - Removed JWT fallback, sanitized logging
- `api/admin.js` - Complete rewrite with permission system
- `api/upload.js` - Require authentication, remove JWT fallback
- `api/rag.js` - Require authentication for ingestion
- `api/test.js` - Protect with DEBUG_SECRET
- `api/test-db.js` - Protect with DEBUG_SECRET

### Created
- `supabase/migrations/20260501_scq_recruitment_content_system.sql` - Complete database schema

---

## 🚀 Next Steps

1. **Run the migration** on Supabase:
   - Copy contents of `supabase/migrations/20260501_scq_recruitment_content_system.sql`
   - Run in Supabase SQL Editor
   - Verify all tables created successfully

2. **Create new backend APIs** (Phase 3):
   - `api/services.js`
   - `api/recruitment-packages.js`
   - `api/quote-requests.js`
   - `api/candidates.js`
   - Update `api/admin.js` with new actions

3. **Build public pages** (Phase 4):
   - Update Home page
   - Create Services page
   - Create Recruitment Packages page
   - Create Quote Request form
   - Create Candidate Registration form

4. **Build admin pages** (Phase 5):
   - Services management
   - Packages management
   - Quote requests management
   - Candidates management
   - Subadmins management (replace localStorage)
   - Home content editor
   - Audit logs viewer

5. **Test everything** according to checklist above

6. **Deploy to Vercel** with required environment variables

---

## ⚠️ Important Notes

- **DO NOT** disable RLS in SQL
- **DO NOT** expose service role key to frontend
- **DO NOT** log sensitive data (passwords, tokens, full user objects)
- **DO NOT** use localStorage as database (only for auth tokens temporarily)
- **ALWAYS** check permissions on backend, never trust frontend
- **MASK** candidate contact info for users without `candidates_view_contact_info` permission
- **LOG** all admin actions to `admin_audit_logs` table

---

## 📝 Environment Variables Required

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-strong-secret-key-min-32-chars

# Optional - for test endpoints
DEBUG_SECRET=your-debug-secret

# Optional - for RAG/AI features
HF_API_KEY=your-huggingface-api-key
```

---

**Status:** Phase 1 Complete ✅ | Ready for Phase 3 Implementation
