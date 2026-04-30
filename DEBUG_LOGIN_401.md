# 🔍 DEBUG LOGIN 401 - Production Testing Guide

## Current Status

**Production URL**: https://sck-tawny.vercel.app

**Issue**: Login returns 401 Unauthorized with message "Invalid email or password"

**Verified Working**: Supabase SQL Editor test works:
```sql
SELECT * FROM login_user('admin@sck.com', 'scq2025');
-- Returns admin user successfully
```

**This means**: The issue is NOT the password or database function. The issue is either:
1. Vercel environment variables point to a different Supabase project
2. The RPC call from Vercel to Supabase is failing
3. The function doesn't exist in the production Supabase project

---

## 🚀 Deployment Status

**Latest Commit**: Added extensive debugging
- Comprehensive logging in `api/auth.js`
- New diagnostic endpoint: `/api/test-db`

**Wait for Vercel deployment** (~2-3 minutes), then proceed with tests below.

---

## 🧪 Test 1: Database Connection Test

After deployment completes, run:

```bash
curl https://sck-tawny.vercel.app/api/test-db
```

**This will show**:
1. If Supabase connection works
2. If `users` table is accessible
3. If admin@sck.com exists
4. If `login_user` function exists
5. If `login_user` function returns data
6. If password hash exists

**Expected Success**:
```json
{
  "success": true,
  "results": {
    "tests": {
      "usersTable": {
        "success": true,
        "userFound": true,
        "userEmail": "admin@sck.com",
        "userRole": "admin",
        "userActive": true
      },
      "loginUserFunction": {
        "success": true,
        "hasData": true,
        "dataLength": 1,
        "userFound": true,
        "userEmail": "admin@sck.com",
        "userRole": "admin"
      },
      "passwordHash": {
        "success": true,
        "hasPasswordHash": true
      }
    }
  }
}
```

**If Test Fails**:
- `usersTable.success: false` → Vercel can't access users table
- `usersTable.userFound: false` → admin@sck.com doesn't exist in production DB
- `loginUserFunction.success: false` → Function doesn't exist or has wrong parameters
- `loginUserFunction.dataLength: 0` → Password doesn't match
- `passwordHash.hasPasswordHash: false` → No password hash stored

---

## 🧪 Test 2: Login with Enhanced Logging

After deployment, try login again:

```bash
curl -i -X POST "https://sck-tawny.vercel.app/api/auth?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sck.com","password":"scq2025"}'
```

**Then check Vercel Logs** for:

### Success Pattern:
```
=== LOGIN DEBUG START ===
AUTH DEBUG: {
  identifierValue: 'admin@sck.com',
  hasPassword: true,
  passwordLength: 7
}
Calling Supabase RPC login_user with: { p_email: 'admin@sck.com', passwordProvided: true }
SUPABASE RPC DEBUG: {
  hasData: true,
  isArray: true,
  dataLength: 1
}
Result is array with length: 1
User found: {
  id: '...',
  email: 'admin@sck.com',
  role: 'admin',
  is_active: true
}
Login successful for: admin@sck.com role: admin
=== LOGIN DEBUG END ===
```

### Failure Patterns:

#### Pattern A: Empty Result
```
SUPABASE RPC DEBUG: {
  hasData: true,
  isArray: true,
  dataLength: 0
}
ERROR: No user found - empty array
```
**Cause**: Password doesn't match OR user doesn't exist in production DB
**Fix**: Verify password hash in production Supabase

#### Pattern B: RPC Error
```
SUPABASE RPC DEBUG: {
  hasError: true,
  errorMessage: 'function login_user does not exist'
}
```
**Cause**: Function not created in production Supabase
**Fix**: Run `CREATE_LOGIN_FUNCTION.sql` in production Supabase SQL Editor

#### Pattern C: Wrong Parameters
```
SUPABASE RPC DEBUG: {
  hasError: true,
  errorMessage: 'function login_user(p_email => text, p_password => text) does not exist'
}
```
**Cause**: Parameter names don't match function definition
**Fix**: Check actual function signature in Supabase

#### Pattern D: Connection Error
```
SUPABASE RPC DEBUG: {
  hasError: true,
  errorMessage: 'Failed to fetch'
}
```
**Cause**: Vercel can't connect to Supabase
**Fix**: Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel

---

## 🔍 Test 3: Verify Environment Variables

The issue is likely that Vercel environment variables point to a **different Supabase project** than where you tested the SQL.

### Check Vercel Environment Variables:

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to Settings → Environment Variables
4. Check `SUPABASE_URL`

**The URL should look like**:
```
https://[PROJECT_REF].supabase.co
```

**Extract the PROJECT_REF** (the part before `.supabase.co`)

### Check Your Supabase Project:

1. Go to: https://supabase.com/dashboard
2. Open the project where you tested the SQL
3. Go to Settings → API
4. Check the **Project URL**

**Compare**:
- Vercel `SUPABASE_URL` project ref
- Supabase project ref where SQL test worked

**If they DON'T match** → That's the problem!

**Fix**: Update Vercel environment variables to use the correct Supabase project URL and service key.

---

## 🔧 Possible Fixes

### Fix 1: Function Doesn't Exist in Production

**If** `/api/test-db` shows `loginUserFunction.success: false`:

1. Go to your Supabase project (the one matching Vercel's SUPABASE_URL)
2. Go to SQL Editor
3. Run `CREATE_LOGIN_FUNCTION.sql`
4. Verify it works:
   ```sql
   SELECT * FROM login_user('admin@sck.com', 'scq2025');
   ```

### Fix 2: User Doesn't Exist in Production

**If** `/api/test-db` shows `usersTable.userFound: false`:

1. Go to Supabase SQL Editor
2. Check if user exists:
   ```sql
   SELECT email, role, is_active FROM users WHERE email = 'admin@sck.com';
   ```
3. If not, run `DATABASE_FIX_SIMPLE.sql` to create the admin user

### Fix 3: Password Hash Mismatch

**If** `/api/test-db` shows `loginUserFunction.dataLength: 0`:

The password hash doesn't match. Reset it:

```sql
UPDATE users 
SET password_hash = crypt('scq2025', gen_salt('bf'))
WHERE email = 'admin@sck.com';
```

Then test:
```sql
SELECT * FROM login_user('admin@sck.com', 'scq2025');
```

### Fix 4: Wrong Supabase Project

**If** Vercel SUPABASE_URL doesn't match your Supabase project:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update `SUPABASE_URL` to the correct project URL
3. Update `SUPABASE_SERVICE_KEY` to the correct service key
4. Redeploy

---

## 📊 Diagnostic Checklist

After deployment, check these in order:

- [ ] Run `/api/test-db` - does it return success?
- [ ] Check Vercel logs for login attempt - what does SUPABASE RPC DEBUG show?
- [ ] Verify Vercel SUPABASE_URL matches your Supabase project
- [ ] Verify `login_user` function exists in production Supabase
- [ ] Verify admin@sck.com exists in production Supabase
- [ ] Verify password hash matches in production Supabase

---

## 🎯 Next Steps

1. **Wait** for Vercel deployment (~2-3 minutes)
2. **Run** `/api/test-db` endpoint
3. **Check** Vercel logs for login attempt
4. **Compare** results with patterns above
5. **Apply** the appropriate fix
6. **Test** login again

---

**I will NOT say "fixed" until actual production tests pass! 🎯**
