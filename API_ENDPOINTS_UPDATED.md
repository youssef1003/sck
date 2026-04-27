# 🔌 API ENDPOINTS - UPDATED (Consolidated for Vercel Hobby Plan)

## ⚠️ Important Change

To fit within Vercel's Hobby plan limit (12 serverless functions), we've consolidated the API endpoints.

**Before**: 15 separate functions  
**After**: 7 consolidated functions ✅

---

## 📡 New API Structure

### 1. **Authentication** - `/api/auth`

All auth endpoints now use query parameter `?action=`

#### Login
```bash
POST /api/auth?action=login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Get Current User
```bash
GET /api/auth?action=me
Headers: Authorization: Bearer <token>
```

#### Refresh Token
```bash
POST /api/auth?action=refresh
```

**Request:**
```json
{
  "token": "old_token"
}
```

---

### 2. **Admin** - `/api/admin`

All admin endpoints now use query parameter `?action=`

**Requires**: Admin JWT token in Authorization header

#### Get Stats
```bash
GET /api/admin?action=stats
Headers: Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "totalBookings": 50,
    "totalContacts": 75
  }
}
```

#### Manage Users
```bash
# Get all users
GET /api/admin?action=users
Headers: Authorization: Bearer <admin_token>

# Create user
POST /api/admin?action=users
Headers: Authorization: Bearer <admin_token>
Body: { "email": "...", "password": "...", "name": "..." }

# Update user
PUT /api/admin?action=users
Headers: Authorization: Bearer <admin_token>
Body: { "id": "uuid", "name": "New Name" }

# Delete user
DELETE /api/admin?action=users
Headers: Authorization: Bearer <admin_token>
Body: { "id": "uuid" }
```

#### Backup Data
```bash
GET /api/admin?action=backup
Headers: Authorization: Bearer <admin_token>
```

#### Manage Tables
```bash
POST /api/admin?action=manage
Headers: Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "table": "blog_posts",
  "operation": "select|insert|update|delete",
  "data": { ... }
}
```

---

### 3. **RAG Chatbot** - `/api/rag`

All RAG endpoints now use query parameter `?action=`

#### Chat with AI
```bash
POST /api/rag?action=chat
```

**Request:**
```json
{
  "message": "What services do you offer?",
  "conversationId": "uuid-optional",
  "language": "en",
  "userId": "uuid-optional"
}
```

**Response:**
```json
{
  "success": true,
  "response": "We offer consulting services...",
  "conversationId": "uuid",
  "contextUsed": 5,
  "sources": [
    {
      "type": "service",
      "id": "service-123",
      "similarity": 0.89
    }
  ]
}
```

#### Ingest Documents
```bash
POST /api/rag?action=ingest
Headers: Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "content": "Document text here...",
  "metadata": {
    "sourceType": "blog",
    "sourceId": "blog-123",
    "language": "en",
    "title": "Document Title"
  }
}
```

---

### 4. **Bookings** - `/api/bookings`

No changes - still works the same

```bash
POST /api/bookings
```

---

### 5. **Contact** - `/api/contact`

No changes - still works the same

```bash
POST /api/contact
```

---

### 6. **Health** - `/api/health`

No changes - still works the same

```bash
GET /api/health
```

---

### 7. **Upload** - `/api/upload`

No changes - still works the same

```bash
POST /api/upload
```

---

## 🔄 Migration Guide

### Frontend Code Changes

#### Before (Old):
```javascript
// Login
await fetch('/api/auth/login', { ... })

// Get user
await fetch('/api/auth/me', { ... })

// Admin stats
await fetch('/api/admin/stats', { ... })

// Chat
await fetch('/api/rag/chat', { ... })
```

#### After (New):
```javascript
// Login
await fetch('/api/auth?action=login', { ... })

// Get user
await fetch('/api/auth?action=me', { ... })

// Admin stats
await fetch('/api/admin?action=stats', { ... })

// Chat
await fetch('/api/rag?action=chat', { ... })
```

### Quick Find & Replace

In your frontend code, replace:

```bash
# Auth endpoints
/api/auth/login → /api/auth?action=login
/api/auth/me → /api/auth?action=me
/api/auth/refresh → /api/auth?action=refresh

# Admin endpoints
/api/admin/stats → /api/admin?action=stats
/api/admin/users → /api/admin?action=users
/api/admin/backup → /api/admin?action=backup
/api/admin/manage → /api/admin?action=manage

# RAG endpoints
/api/rag/chat → /api/rag?action=chat
/api/rag/ingest → /api/rag?action=ingest
```

---

## 📊 Function Count

| Endpoint | Count |
|----------|-------|
| `/api/auth` | 1 (was 3) |
| `/api/admin` | 1 (was 5) |
| `/api/rag` | 1 (was 2) |
| `/api/bookings` | 1 |
| `/api/contact` | 1 |
| `/api/health` | 1 |
| `/api/upload` | 1 |
| **TOTAL** | **7** ✅ (was 15) |

**Result**: Now within Vercel Hobby plan limit (12 functions)!

---

## ✅ Testing

### Test Auth
```bash
# Login
curl -X POST http://localhost:3000/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get user
curl http://localhost:3000/api/auth?action=me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test RAG
```bash
# Chat
curl -X POST http://localhost:3000/api/rag?action=chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'
```

### Test Admin
```bash
# Stats
curl http://localhost:3000/api/admin?action=stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🚀 Deploy

Now you can deploy without hitting the function limit:

```bash
git add .
git commit -m "Consolidate API endpoints for Vercel Hobby plan"
git push origin main
```

Vercel will automatically redeploy! ✅

---

## 📝 Notes

- All endpoints maintain the same functionality
- Only the URL structure changed (added `?action=` parameter)
- Frontend needs minor updates to use new URLs
- Backward compatible - old endpoints still exist but won't be deployed

---

**Status**: ✅ Ready to deploy within Vercel limits!
