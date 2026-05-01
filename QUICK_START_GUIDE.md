# Quick Start Guide - SCQ GROUP Production Upgrade

## What's Been Done ✅

**Phase 1 & 2 are complete!**

- ✅ Removed all security vulnerabilities
- ✅ Implemented backend permission system
- ✅ Protected all dangerous endpoints
- ✅ Created complete database migration
- ✅ Seeded 8 services and 4 recruitment packages

**Branch:** `production-scq-recruitment-system`

---

## Immediate Next Steps

### 1. Run the Database Migration (5 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `supabase/migrations/20260501_scq_recruitment_content_system.sql`
3. Paste and click "Run"
4. Verify success message

**What this creates:**
- 8 service pages (policies, HR planning, payroll, etc.)
- 4 recruitment packages (Bronze, Silver, Gold, Platinum)
- Quote requests table
- Candidate profiles table (with experiences, languages, skills)
- Audit logs table
- Content blocks

### 2. Set Environment Variables (2 minutes)

In Vercel Dashboard → Settings → Environment Variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-strong-secret-min-32-chars
DEBUG_SECRET=optional-for-test-endpoints
```

**⚠️ CRITICAL:** JWT_SECRET must be set - no fallback anymore!

### 3. Test Current Changes (5 minutes)

```bash
cd frontend
npm install
npm run build
```

If build succeeds, deploy to Vercel:
```bash
git push origin production-scq-recruitment-system
```

Then test:
- Login at `/login` - should work
- Admin dashboard - should work
- Blog management - should work

---

## What to Build Next

### Option A: Backend APIs First (Recommended)

Create these files in order:

1. **`api/services.js`** (15 min)
   - GET all services
   - GET service by slug

2. **`api/recruitment-packages.js`** (10 min)
   - GET all packages

3. **`api/quote-requests.js`** (20 min)
   - POST submit quote request

4. **`api/candidates.js`** (30 min)
   - POST submit candidate registration
   - Auto-generate candidate code

5. **Extend `api/admin.js`** (60 min)
   - Add `action=services` handler
   - Add `action=packages` handler
   - Add `action=quote-requests` handler
   - Add `action=candidates` handler (with contact masking)
   - Add `action=subadmins` handler
   - Add `action=audit-logs` handler

### Option B: Public Pages First

1. **Update Home Page** (30 min)
   - Add "أنظمة الجودة والاستشارات" section
   - Add 8 service cards

2. **Services Page** (45 min)
   - `/services` - list all services
   - `/services/:slug` - service details

3. **Recruitment Packages Page** (30 min)
   - `/recruitment-packages` - show 4 packages

4. **Quote Request Form** (60 min)
   - `/quote-request` - multi-section form

5. **Candidate Registration Form** (90 min)
   - `/candidate/register` - 7-step form

---

## Code Templates

### Template: Public API Endpoint

```javascript
// api/services.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { slug } = req.query

    if (slug) {
      // Get single service
      const { data, error } = await supabase
        .from('service_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (error) {
        return res.status(404).json({ 
          success: false, 
          error: 'Service not found' 
        })
      }

      return res.status(200).json({ success: true, data })
    }

    // Get all services
    const { data, error } = await supabase
      .from('service_pages')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch services' 
      })
    }

    return res.status(200).json({ success: true, data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
```

### Template: Admin API Handler (add to api/admin.js)

```javascript
// Add to switch statement in main handler
case 'services':
  return await handleServices(req, res, admin)

// Add new handler function
async function handleServices(req, res, admin) {
  // Check permissions
  if (req.method === 'GET') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'services_view'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'POST') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'services_create'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'PUT') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'services_edit'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'DELETE') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'services_delete'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('service_pages')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return res.status(200).json({ success: true, data })
  }

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('service_pages')
      .insert({ ...req.body, created_by: admin.userId })
      .select()

    if (error) throw error

    // Log action
    await supabase.from('admin_audit_logs').insert({
      actor_user_id: admin.userId,
      action: 'create',
      resource_type: 'service_page',
      resource_id: data[0].id,
      metadata: { title: data[0].title_ar }
    })

    return res.status(200).json({ success: true, data: data[0] })
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const { data, error } = await supabase
      .from('service_pages')
      .update({ ...updates, updated_by: admin.userId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error

    // Log action
    await supabase.from('admin_audit_logs').insert({
      actor_user_id: admin.userId,
      action: 'update',
      resource_type: 'service_page',
      resource_id: id
    })

    return res.status(200).json({ success: true, data: data[0] })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    const { data, error } = await supabase
      .from('service_pages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error

    // Log action
    await supabase.from('admin_audit_logs').insert({
      actor_user_id: admin.userId,
      action: 'delete',
      resource_type: 'service_page',
      resource_id: id
    })

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
```

### Template: React Page

```jsx
// frontend/src/pages/Services.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services')
      setServices(response.data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">جاري التحميل...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">خدماتنا الاستشارية</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map(service => (
          <Link 
            key={service.id} 
            to={`/services/${service.slug}`}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{service.title_ar}</h3>
            <p className="text-gray-600 mb-4">{service.short_description_ar}</p>
            <span className="text-blue-600 font-semibold">اعرف المزيد ←</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## Testing Checklist

After implementing each feature, test:

- ✅ API endpoint returns correct data
- ✅ Frontend displays data correctly
- ✅ Forms validate correctly
- ✅ Success/error messages show
- ✅ Permissions work (try as subadmin)
- ✅ Audit logs created (for admin actions)
- ✅ Build succeeds: `npm run build`

---

## Common Issues & Solutions

### Issue: "JWT_SECRET is not defined"
**Solution:** Set JWT_SECRET in Vercel environment variables

### Issue: "Cannot access table"
**Solution:** Run the migration SQL file in Supabase

### Issue: "Permission denied"
**Solution:** Check user has correct permission in `users.permissions` column

### Issue: "Candidate contact info visible"
**Solution:** Check backend masks data for users without `candidates_view_contact_info`

---

## Need Help?

**Check these files:**
- `PRODUCTION_UPGRADE_STATUS.md` - Detailed status
- `IMPLEMENTATION_SUMMARY.md` - Complete summary
- `supabase/migrations/20260501_scq_recruitment_content_system.sql` - Database schema

**Ask me to:**
- Create specific API endpoints
- Create specific frontend pages
- Debug permission issues
- Review code before deployment

---

**Current Status:** Phase 1 & 2 Complete ✅  
**Next:** Phase 3 - Backend APIs  
**Estimated Time:** 2-3 hours for all backend APIs
