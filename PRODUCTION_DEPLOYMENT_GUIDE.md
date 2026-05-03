# SCQ GROUP - Production Deployment Guide

**Date**: May 3, 2026  
**Status**: Ready for Deployment  
**Phases Complete**: A (Auth), B (Backend), C (Migration)  

---

## 🎯 DEPLOYMENT OVERVIEW

This guide will walk you through deploying the SCQ GROUP platform to production. All code is ready - you just need to configure environment variables, deploy, and run the migration.

**Estimated Time**: 15-20 minutes

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before starting, ensure you have:

- [ ] Vercel account with project connected
- [ ] Supabase project created
- [ ] Supabase Service Role Key (from Supabase Dashboard → Settings → API)
- [ ] Strong JWT secret (min 32 characters)
- [ ] Hugging Face API key (optional, for AI chatbot)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add the following variables:

#### Required Variables:

```
SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production, Preview, Development
```

```
SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
Environment: Production, Preview, Development
```

```
JWT_SECRET
Value: your-strong-secret-min-32-chars-random-string
Environment: Production, Preview, Development
```

**⚠️ CRITICAL**: 
- `JWT_SECRET` must be at least 32 characters
- Use a strong random string (not a simple password)
- Generate with: `openssl rand -base64 32` or use a password generator

#### Optional Variables:

```
HF_API_KEY
Value: hf_... (your Hugging Face API key)
Environment: Production, Preview, Development
Note: Only needed if you want the AI chatbot feature
```

```
DEBUG_SECRET
Value: your-debug-secret
Environment: Development only
Note: For debugging endpoints
```

3. Click "Save" after adding each variable

---

### STEP 2: Deploy to Vercel

#### Option A: Deploy via Git Push (Recommended)

```bash
# Commit all changes
git add .
git commit -m "Production deployment - Phases A, B, C complete"

# Push to main branch
git push origin main
```

Vercel will automatically detect the push and deploy.

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Deploy to production
vercel --prod
```

#### Option C: Deploy via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment
4. Select "Production" environment
5. Click "Redeploy"

**Wait for deployment to complete** (usually 2-3 minutes)

---

### STEP 3: Run Database Migration

1. Go to Supabase Dashboard → SQL Editor

2. Open the migration file:
   - File: `supabase/migrations/20260503_complete_production_schema.sql`
   - Copy the entire contents (813 lines)

3. Paste into Supabase SQL Editor

4. Click "Run" button

5. **Verify Success**:
   - You should see "Success. No rows returned"
   - Check the "Tables" section - you should see 13 new tables:
     - users
     - page_content
     - blog_posts
     - contact_requests
     - consultation_bookings
     - service_pages
     - recruitment_packages
     - quote_requests
     - candidate_profiles
     - candidate_experiences
     - candidate_languages
     - candidate_computer_skills
     - admin_audit_logs

---

### STEP 4: Create Admin User

1. In Supabase SQL Editor, run this SQL:

```sql
SELECT * FROM create_user_with_password(
  'admin@scqgroup.com',           -- Change to your email
  'Admin User',                    -- Change to your name
  'YourSecurePassword123!',        -- Change to a strong password
  'super_admin',
  '["*"]'::jsonb
);
```

2. **Save your credentials**:
   - Email: `admin@scqgroup.com` (or whatever you used)
   - Password: `YourSecurePassword123!` (or whatever you used)

3. You should see a result with your new user ID and details

---

### STEP 5: Verify Production Deployment

#### 5.1 Test Login

1. Visit your production URL: `https://your-project.vercel.app`
2. Click "تسجيل الدخول" (Login) in the header
3. Enter admin credentials from Step 4
4. You should be redirected to `/admin/dashboard`

#### 5.2 Test Admin Dashboard

Verify each admin page loads:

- [ ] **Dashboard** (`/admin/dashboard`) - Shows stats
- [ ] **Services Management** (`/admin/services`) - Lists 8 services
- [ ] **Packages Management** (`/admin/packages`) - Lists 4 packages
- [ ] **Quote Requests** (`/admin/quote-requests`) - Empty list (no requests yet)
- [ ] **Candidates Management** (`/admin/candidates`) - Empty list (no candidates yet)
- [ ] **Contact Requests** (`/admin/contacts`) - Empty list (no contacts yet)
- [ ] **Blog Management** (`/admin/blog`) - Empty list (no posts yet)
- [ ] **Subadmins Management** (`/admin/subadmins`) - Shows only your admin user
- [ ] **Audit Logs** (`/admin/audit-logs`) - Shows your login action
- [ ] **Home Content Editor** (`/admin/home-content`) - Shows home page content

#### 5.3 Test Public Pages

- [ ] **Home Page** (`/`) - Loads with services and packages
- [ ] **Services Page** (`/services`) - Lists 8 services
- [ ] **Service Detail** (`/services/policies-structure`) - Shows service details
- [ ] **Recruitment Page** (`/recruitment`) - Lists 4 packages
- [ ] **Blog Page** (`/blog`) - Empty (no posts yet)
- [ ] **Contact Page** (`/contact`) - Contact form works
- [ ] **About Page** (`/about`) - Loads

#### 5.4 Test Forms

- [ ] **Contact Form** - Submit a test contact request
  - Go to `/contact`
  - Fill out form
  - Submit
  - Check `/admin/contacts` - should see your request

- [ ] **Booking Form** - Submit a test booking
  - Click "احجز استشارة" button on home page
  - Fill out booking form
  - Submit
  - Check Supabase `consultation_bookings` table - should see your booking

- [ ] **Candidate Registration** - Submit a test candidate
  - Go to `/candidate-registration`
  - Fill out form (all required fields)
  - Submit
  - Check `/admin/candidates` - should see your candidate

---

### STEP 6: Create First Blog Post (Optional)

1. Go to `/admin/blog`
2. Click "إضافة مقال جديد" (Add New Post)
3. Fill out:
   - Title: "مرحباً بكم في SCQ GROUP"
   - Excerpt: "نحن سعداء بإطلاق موقعنا الجديد"
   - Content: Write some content
   - Author: "فريق SCQ"
   - Category: "أخبار"
4. Click "نشر" (Publish)
5. Visit `/blog` - should see your post

---

## 🔒 SECURITY CHECKLIST

After deployment, verify:

- [ ] Admin dashboard requires login
- [ ] Cannot access `/admin/*` without authentication
- [ ] Subadmins only see pages they have permissions for
- [ ] Public pages load without authentication
- [ ] Contact info in candidates is masked for subadmins without `candidates_view_contact_info` permission
- [ ] Audit logs record all admin actions

---

## 🐛 TROUBLESHOOTING

### Issue: "Missing required environment variables"

**Solution**: 
- Check Vercel environment variables are set correctly
- Redeploy after adding variables
- Verify variable names match exactly (case-sensitive)

### Issue: "Database configuration error"

**Solution**:
- Verify `SUPABASE_URL` is correct (should end with `.supabase.co`)
- Verify `SUPABASE_SERVICE_KEY` is the **service role key**, not anon key
- Check Supabase project is not paused

### Issue: "Invalid token" or "Not authorized"

**Solution**:
- Verify `JWT_SECRET` is set and at least 32 characters
- Clear browser localStorage and login again
- Check admin user was created successfully

### Issue: Migration fails with "relation already exists"

**Solution**:
- This is normal if you've run the migration before
- The migration is idempotent (safe to run multiple times)
- If you want a clean start, drop all tables first (⚠️ destroys data)

### Issue: Booking form shows "حدث خطأ"

**Solution**:
- Check browser console for errors
- Verify `/api/bookings` endpoint is accessible
- Check Supabase `consultation_bookings` table exists

### Issue: Candidate registration fails

**Solution**:
- Ensure all required fields are filled:
  - Nationality
  - Gender
  - City
  - Education Level
  - Functional Sector
- Check browser console for validation errors

---

## 📊 POST-DEPLOYMENT MONITORING

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Monitor for errors
3. Common issues:
   - Missing environment variables
   - Database connection errors
   - API endpoint errors

### Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Monitor for:
   - Failed queries
   - RLS policy violations
   - Connection issues

### Monitor Admin Audit Logs

1. Go to `/admin/audit-logs`
2. Review all admin actions
3. Look for suspicious activity

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

- ✅ Production URL loads
- ✅ Admin login works
- ✅ All 9 admin pages load without errors
- ✅ Public pages load
- ✅ Contact form submits successfully
- ✅ Booking form submits successfully
- ✅ Candidate registration works
- ✅ Admin can create blog posts
- ✅ Admin can manage services/packages
- ✅ Audit logs record actions

---

## 📞 SUPPORT

If you encounter issues:

1. Check this troubleshooting guide
2. Review Vercel deployment logs
3. Review Supabase logs
4. Check browser console for errors
5. Verify all environment variables are set

---

## 🚀 NEXT STEPS AFTER DEPLOYMENT

1. **Create Content**:
   - Add blog posts
   - Update home page content
   - Add service images

2. **Configure Subadmins**:
   - Create subadmin accounts
   - Assign permissions
   - Test permission restrictions

3. **Test Workflows**:
   - Contact request workflow
   - Quote request workflow
   - Candidate verification workflow
   - Booking confirmation workflow

4. **Monitor Performance**:
   - Check Vercel analytics
   - Monitor Supabase usage
   - Review audit logs regularly

5. **Backup Strategy**:
   - Set up Supabase automatic backups
   - Export data regularly
   - Document recovery procedures

---

## 📝 DEPLOYMENT SUMMARY

**Phases Completed**:
- ✅ Phase A: Core Auth, Roles, Permissions, Admin API Client
- ✅ Phase B: Backend API Fixes (contact-requests, validation, RAG safety)
- ✅ Phase C: Migration File Organization

**Files Modified**: 18 files
**Build Status**: ✅ PASSING
**Migration Status**: ✅ READY
**Production Readiness**: ✅ READY TO DEPLOY

**Deployment Steps**:
1. Set environment variables (5 min)
2. Deploy to Vercel (3 min)
3. Run migration (2 min)
4. Create admin user (1 min)
5. Verify deployment (5-10 min)

**Total Time**: 15-20 minutes

---

**Good luck with your deployment! 🚀**
