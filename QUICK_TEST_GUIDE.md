# ⚡ Quick Test Guide - Login Fix

## 🎯 What Was Fixed

Enhanced `api/auth.js` with:
- ✅ Comprehensive logging at every step
- ✅ Action parameter normalization
- ✅ Support for email/username/identifier
- ✅ Better error handling
- ✅ Environment variable validation

**Credentials**: `admin@sck.com` / `scq2025`

---

## 🚀 Quick Test (After Deployment)

### 1. Test with curl (30 seconds)
```bash
curl -X POST https://sck-tawny.vercel.app/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sck.com","password":"scq2025"}'
```

**✅ Success looks like**:
```json
{"success":true,"message":"Login successful","token":"eyJ...","data":{...}}
```

**❌ Failure looks like**:
```json
{"success":false,"message":"Invalid email or password"}
```

---

### 2. Check Vercel Logs (1 minute)
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click "Logs" tab
4. Look for these lines:

**✅ Success pattern**:
```
Auth request: { method: 'POST', normalizedAction: 'login', hasBody: true }
Login attempt: { identifier: 'admin@sck.com', hasPassword: true }
Supabase RPC result: { hasData: true, dataLength: 1 }
User found: { email: 'admin@sck.com', role: 'admin' }
Login successful for: admin@sck.com
```

**❌ Failure patterns**:

**Pattern A - No body**:
```
Login attempt: { identifier: undefined, hasPassword: false }
```
→ **Fix**: Check Content-Type header

**Pattern B - Function missing**:
```
Supabase RPC result: { hasError: true, errorMessage: 'function login_user does not exist' }
```
→ **Fix**: Run `CREATE_LOGIN_FUNCTION.sql` in Supabase

**Pattern C - Wrong password**:
```
Supabase RPC result: { dataLength: 0 }
No user found - empty array
```
→ **Fix**: Verify password in Supabase:
```sql
SELECT * FROM login_user('admin@sck.com', 'scq2025');
```

**Pattern D - Missing env vars**:
```
Missing Supabase credentials: { hasUrl: false }
```
→ **Fix**: Set environment variables in Vercel

---

### 3. Test in Browser (2 minutes)
1. Open: https://sck-tawny.vercel.app/login
2. Press F12 (DevTools)
3. Go to Console tab
4. Login:
   - Email: `admin@sck.com`
   - Password: `scq2025`
5. Check:
   - ✅ No 401 errors
   - ✅ Redirects to dashboard
   - ✅ Token saved in localStorage

---

## 🔍 Quick Diagnosis

| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 + "identifier: undefined" | Body not parsed | Check Content-Type |
| 401 + "function does not exist" | SQL not run | Run CREATE_LOGIN_FUNCTION.sql |
| 401 + "dataLength: 0" | Wrong password | Verify in Supabase |
| 500 + "Missing credentials" | No env vars | Set in Vercel |
| 200 + token | ✅ Working! | 🎉 |

---

## 📚 Full Documentation

- **English**: `LOGIN_FIX_EXPLANATION.md`
- **Arabic**: `إصلاح_تسجيل_الدخول.md`
- **Testing**: `TEST_LOGIN_API.md`

---

## ✅ Expected Result

After deployment, login with `admin@sck.com` / `scq2025` should:
1. ✅ Return 200 status
2. ✅ Return JSON with `success: true`
3. ✅ Return `token` and `data.access_token`
4. ✅ Return user object with role: "admin"
5. ✅ Redirect to admin dashboard

---

**ومن غير ما نبوظ أي حاجة خالص ✅**
