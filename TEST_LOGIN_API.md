# Test Login API - Debugging Guide

## Current Issue
Login returns 401 Unauthorized even though Supabase SQL test works:
```sql
SELECT * FROM login_user('admin@sck.com', 'scq2025');
-- ✅ This works in Supabase
```

## Possible Causes

### 1. **Request Body Not Parsed**
Vercel might not be parsing JSON body automatically.

**Solution**: Vercel serverless functions should auto-parse, but let's verify the body is received.

### 2. **Action Parameter Has Special Characters**
The URL might have spaces or backslashes: `/api/auth?action=login%20\`

**Solution**: Added normalization in code:
```javascript
const action = String(rawAction).trim().replace(/[\\/\s]/g, '').toLowerCase()
```

### 3. **Supabase RPC Returns Different Format**
The function might return a single object instead of an array.

**Solution**: Added handling for both:
```javascript
if (Array.isArray(result)) {
  user = result[0]
} else if (result && typeof result === 'object') {
  user = result
}
```

### 4. **Environment Variables Missing**
SUPABASE_URL or SUPABASE_SERVICE_KEY might not be set correctly.

**Solution**: Added error checking and logging.

## Test Commands

### Test 1: Health Check
```bash
curl https://sck-tawny.vercel.app/api/health
```
Expected: `{"success":true,"message":"API is healthy"}`

### Test 2: Login with curl
```bash
curl -X POST https://sck-tawny.vercel.app/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sck.com","password":"scq2025"}'
```

Expected Success:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "admin@sck.com",
      "full_name": "Super Admin",
      "role": "admin",
      "is_active": true
    }
  }
}
```

### Test 3: Check Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to "Logs" tab
4. Look for console.log output:
   - "Auth request:"
   - "Login attempt:"
   - "Calling Supabase RPC login_user"
   - "Supabase RPC result:"
   - "User found:" or "No user found"

## Debug Output to Look For

### If you see:
```
Auth request: { method: 'POST', rawAction: 'login', normalizedAction: 'login', hasBody: true }
Login attempt: { identifier: 'admin@sck.com', hasPassword: true }
Calling Supabase RPC login_user with identifier: admin@sck.com
Supabase RPC result: { hasData: true, isArray: true, dataLength: 1, hasError: false }
User found: { id: '...', email: 'admin@sck.com', role: 'admin', is_active: true }
Login successful for: admin@sck.com
```
✅ **Login should work!**

### If you see:
```
Supabase RPC result: { hasData: false, hasError: true, errorMessage: '...' }
```
❌ **Problem with Supabase connection or function**

### If you see:
```
Login attempt: { identifier: undefined, hasPassword: false }
```
❌ **Request body not being parsed**

## Changes Made to api/auth.js

### 1. Added Action Normalization
```javascript
const action = String(rawAction).trim().replace(/[\\/\s]/g, '').toLowerCase()
```

### 2. Added Support for username/email/identifier
```javascript
const identifier = req.body.email || req.body.username || req.body.identifier
```

### 3. Added Comprehensive Logging
```javascript
console.log('Login attempt:', { identifier, hasPassword: !!password })
console.log('Supabase RPC result:', { hasData: !!result, isArray: Array.isArray(result) })
console.log('User found:', { id: user.id, email: user.email })
```

### 4. Added Better Error Handling
- Handles both array and object responses from Supabase
- Checks for empty results
- Validates user.is_active
- Returns proper error messages

### 5. Added Environment Variable Validation
```javascript
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials')
}
```

## Next Steps After Deployment

1. **Deploy to Vercel**:
   ```bash
   git add api/auth.js
   git commit -m "Fix: Enhanced login debugging and error handling"
   git push origin main
   ```

2. **Wait for deployment** to complete

3. **Test with curl** (see Test 2 above)

4. **Check Vercel Logs** to see debug output

5. **Test in browser**:
   - Go to: https://sck-tawny.vercel.app/login
   - Open DevTools Console (F12)
   - Login with: admin@sck.com / scq2025
   - Check console for errors
   - Check Network tab for API response

## Expected Fix

The most likely issue is that the Supabase RPC is returning an empty array or the password verification is failing. The enhanced logging will show us exactly what's happening.

The code now:
- ✅ Normalizes the action parameter
- ✅ Supports email/username/identifier fields
- ✅ Handles both array and object responses
- ✅ Logs all steps for debugging
- ✅ Returns proper JSON error messages
- ✅ Validates environment variables

## If Login Still Fails

Check these in order:

1. **Verify SQL function exists**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'login_user';
   ```

2. **Test SQL function directly**:
   ```sql
   SELECT * FROM login_user('admin@sck.com', 'scq2025');
   ```

3. **Check password hash**:
   ```sql
   SELECT email, password_hash, 
          crypt('scq2025', password_hash) = password_hash as password_matches
   FROM users WHERE email = 'admin@sck.com';
   ```

4. **Verify user is active**:
   ```sql
   SELECT email, is_active, deleted_at FROM users WHERE email = 'admin@sck.com';
   ```
