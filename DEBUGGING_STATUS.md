# 🔍 DEBUGGING STATUS - Login 401 Issue

## Current Status: DEBUGGING IN PROGRESS

**I am NOT claiming the issue is fixed. I am actively debugging.**

---

## ✅ What I've Done

### 1. Added Safe Diagnostic Endpoint
**File**: `api/test-db.js` (TEMPORARY - will be removed after fix)

**Security**:
- ✅ Does NOT expose password hashes
- ✅ Does NOT expose full environment variables
- ✅ Does NOT expose Supabase service keys
- ✅ Only shows masked project ref (first 4 + last 4 chars)
- ✅ Only returns safe booleans and error messages

**What it tests**:
1. Can Vercel connect to Supabase?
2. Can it access the users table?
3. Does admin@sck.com exist?
4. Does login_user function exist?
5. Does login_user return data for admin@sck.com/scq2025?

**Diagnosis output**:
```json
{
  "diagnosis": {
    "canConnectToSupabase": true/false,
    "canAccessUsersTable": true/false,
    "adminUserExists": true/false,
    "loginFunctionExists": true/false,
    "loginFunctionWorks": true/false,
    "overallStatus": "Clear error message or SUCCESS"
  }
}
```

### 2. Enhanced Logging in auth.js
Added comprehensive logging that shows:
- Identifier received
- Password length (not password itself)
- Supabase RPC response details
- Data length
- Error codes and messages
- User found details

---

## 🧪 Next Steps (After Deployment)

### Step 1: Run Diagnostic Endpoint

Wait ~2 minutes for Vercel deployment, then:

```bash
curl https://sck-tawny.vercel.app/api/test-db
```

### Step 2: Interpret Results

#### Scenario A: adminUserExists = false
**Problem**: admin@sck.com doesn't exist in production Supabase
**Fix**: 
1. Go to production Supabase SQL Editor
2. Run `DATABASE_FIX_SIMPLE.sql`
3. Verify: `SELECT * FROM users WHERE email = 'admin@sck.com';`

#### Scenario B: loginFunctionExists = false
**Problem**: login_user function doesn't exist in production
**Fix**:
1. Go to production Supabase SQL Editor
2. Run `CREATE_LOGIN_FUNCTION.sql`
3. Verify: `SELECT * FROM login_user('admin@sck.com', 'scq2025');`

#### Scenario C: loginFunctionWorks = false (but exists)
**Problem**: Function returns no data - password hash mismatch
**Fix**:
1. Reset password in production:
   ```sql
   UPDATE users 
   SET password_hash = crypt('scq2025', gen_salt('bf'))
   WHERE email = 'admin@sck.com';
   ```
2. Verify: `SELECT * FROM login_user('admin@sck.com', 'scq2025');`

#### Scenario D: All tests pass but login still 401
**Problem**: Bug in auth.js logic after RPC returns data
**Fix**: Check auth.js handleLogin function logic

#### Scenario E: canAccessUsersTable = false
**Problem**: Vercel env vars point to wrong Supabase project
**Fix**:
1. Check Vercel SUPABASE_URL project ref (from diagnostic)
2. Compare with your Supabase project URL
3. Update Vercel environment variables if different
4. Redeploy

### Step 3: Apply the Fix

Based on the diagnostic results, apply the appropriate fix above.

### Step 4: Test Production Login

```bash
curl -i -X POST "https://sck-tawny.vercel.app/api/auth?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sck.com","password":"scq2025"}'
```

**Expected Success**:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...",
  "user": {
    "email": "admin@sck.com",
    "role": "admin",
    "is_active": true
  }
}
```

### Step 5: Test /me Endpoint

Extract token from login response, then:

```bash
curl -i -X GET "https://sck-tawny.vercel.app/api/auth?action=me" \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Success**:
```
HTTP/1.1 200 OK

{
  "success": true,
  "user": {
    "email": "admin@sck.com",
    "role": "admin"
  }
}
```

### Step 6: Test in Browser

1. Go to: https://sck-tawny.vercel.app/login
2. Open DevTools (F12) → Console
3. Login: admin@sck.com / scq2025
4. **Expected**:
   - ✅ No 401 errors
   - ✅ Redirects to /admin/dashboard
   - ✅ Dashboard loads
   - ✅ Refresh doesn't logout

### Step 7: Remove Diagnostic Endpoint

After login works, remove or secure `/api/test-db`:

**Option A: Remove**
```bash
git rm api/test-db.js
git commit -m "Remove temporary diagnostic endpoint"
git push
```

**Option B: Secure with header**
Add to top of `api/test-db.js`:
```javascript
// Require secret header
const SECRET = process.env.DIAGNOSTIC_SECRET || 'change-me'
if (req.headers['x-diagnostic-secret'] !== SECRET) {
  return res.status(403).json({ error: 'Forbidden' })
}
```

---

## 📊 Diagnostic Checklist

- [ ] Vercel deployment completed
- [ ] Ran `/api/test-db` endpoint
- [ ] Identified root cause from diagnostic
- [ ] Applied appropriate fix
- [ ] Tested login with curl - got 200
- [ ] Tested /me with token - got 200
- [ ] Tested login in browser - works
- [ ] Dashboard loads after login
- [ ] Removed or secured `/api/test-db`

---

## ⚠️ Important Notes

1. **I will NOT say "fixed" until**:
   - Production curl test returns 200
   - Browser login works
   - Dashboard loads
   - You confirm it works

2. **The diagnostic endpoint is TEMPORARY**:
   - It will be removed after debugging
   - It does not expose sensitive data
   - It only shows safe diagnostic info

3. **Most likely root cause**:
   - Vercel env vars point to different Supabase project
   - OR login_user function doesn't exist in production
   - OR admin user doesn't exist in production
   - OR password hash doesn't match

---

## 🎯 Current Action Required

**Please wait ~2 minutes for Vercel deployment, then run**:

```bash
curl https://sck-tawny.vercel.app/api/test-db
```

**Share the output**, and I will tell you exactly what to fix based on the diagnosis.

---

**Status: Waiting for deployment and diagnostic results** ⏳
