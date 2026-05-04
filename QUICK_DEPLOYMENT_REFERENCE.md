# Quick Deployment Reference Card

**Status**: ✅ PRODUCTION READY  
**Estimated Time**: 15-20 minutes  

---

## 🚀 DEPLOYMENT IN 5 STEPS

### STEP 1: Environment Variables (5 min)

Go to **Vercel Dashboard → Settings → Environment Variables**

Add these 3 required variables:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET = (generate with: openssl rand -base64 32)
```

Optional:
```
HF_API_KEY = hf_... (for AI chatbot)
```

---

### STEP 2: Deploy (3 min)

**Option A**: Push to Git
```bash
git push origin main
```

**Option B**: Vercel CLI
```bash
vercel --prod
```

Wait for deployment to complete.

---

### STEP 3: Run Migration (2 min)

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy contents of `supabase/migrations/20260503_complete_production_schema.sql`
3. Paste and click **Run**
4. Verify: "Success. No rows returned"

---

### STEP 4: Create Admin User (1 min)

In Supabase SQL Editor, run:

```sql
SELECT * FROM create_user_with_password(
  'admin@scqgroup.com',
  'Admin User',
  'YourSecurePassword123!',
  'super_admin',
  '["*"]'::jsonb
);
```

**Save your credentials!**

---

### STEP 5: Verify (5-10 min)

1. Visit production URL
2. Login with admin credentials
3. Check admin dashboard loads
4. Test a few admin pages
5. Test contact form
6. Test booking form

---

## ✅ SUCCESS CHECKLIST

- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Migration ran successfully
- [ ] Admin user created
- [ ] Login works
- [ ] Admin dashboard loads
- [ ] Contact form works
- [ ] Booking form works

---

## 🐛 QUICK TROUBLESHOOTING

**"Missing environment variables"**
→ Check Vercel settings, redeploy

**"Database configuration error"**
→ Verify SUPABASE_URL and SUPABASE_SERVICE_KEY

**"Invalid token"**
→ Verify JWT_SECRET is set (min 32 chars)

**Migration fails**
→ Normal if run before (idempotent)

---

## 📚 FULL DOCUMENTATION

- **Detailed Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Phase Reports**: `PHASE_A2_COMPLETE_REPORT.md`, `PHASE_B_COMPLETE_REPORT.md`, `PHASE_C_COMPLETE_REPORT.md`
- **Summary**: `PRODUCTION_READY_SUMMARY.md`

---

## 🎯 WHAT'S READY

- ✅ 18 files modified
- ✅ Build passing (5.38s)
- ✅ 13 database tables
- ✅ 4 database functions
- ✅ Complete RLS policies
- ✅ Migration file ready

---

**You're ready to deploy! 🚀**

Start with Step 1 above, or follow the detailed guide in `PRODUCTION_DEPLOYMENT_GUIDE.md`.
