# خطوات التشخيص - مهم جداً! 🔍

## التاريخ: 29 أبريل 2026

---

## 🎯 الهدف

**نتأكد أن الـ APIs تشتغل قبل ما نختبر الشات!**

---

## ⏳ الخطوة 0: انتظر Deploy (3 دقائق)

### افتح Vercel Dashboard:
```
https://vercel.com/dashboard
```

### انتظر لما يبقى:
- ✅ Status: Ready
- ✅ Commit: 538bb62
- ✅ Time: آخر 5 دقائق

---

## 🧪 الخطوة 1: اختبر Test API (مهم!)

### افتح في Browser:
```
https://sck-tawny.vercel.app/api/test
```

### المتوقع:
```json
{
  "success": true,
  "message": "API is working!",
  "timestamp": "2026-04-29T...",
  "method": "GET",
  "url": "/api/test"
}
```

### إذا شفت ده:
✅ **الـ APIs تشتغل!** - روح للخطوة 2

### إذا شفت خطأ:
❌ **الـ APIs مش شغالة!** - فيه مشكلة في Vercel configuration

---

## 🧪 الخطوة 2: اختبر Health API

### افتح في Browser:
```
https://sck-tawny.vercel.app/api/health
```

### المتوقع:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-29T...",
  "environment": {
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_KEY": true,
    "JWT_SECRET": true
  },
  "message": "API is working!"
}
```

### تحقق من:
- ✅ `SUPABASE_URL: true`
- ✅ `SUPABASE_SERVICE_KEY: true`

### إذا أي واحد `false`:
❌ **Environment variables ناقصة!**
- روح Vercel Dashboard
- Settings → Environment Variables
- أضف الـ variables الناقصة

---

## 🧪 الخطوة 3: اختبر RAG API (مهم جداً!)

### استخدم Postman أو curl:

#### Option 1: Postman
```
POST https://sck-tawny.vercel.app/api/rag?action=chat
Content-Type: application/json

Body:
{
  "message": "مرحبا",
  "language": "ar"
}
```

#### Option 2: curl (في Terminal)
```bash
curl -X POST https://sck-tawny.vercel.app/api/rag?action=chat \
  -H "Content-Type: application/json" \
  -d '{"message":"مرحبا","language":"ar"}'
```

#### Option 3: Browser Console
```javascript
fetch('https://sck-tawny.vercel.app/api/rag?action=chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'مرحبا', language: 'ar' })
})
.then(r => r.json())
.then(d => console.log(d))
```

### المتوقع:
```json
{
  "success": true,
  "response": "مرحباً! أنا مساعد SCK...",
  "conversationId": null,
  "contextUsed": 0,
  "sources": [],
  "model": "Hugging Face (Free)"
}
```

### إذا شفت ده:
✅ **RAG API تشتغل!** - الشات لازم يشتغل الآن!

### إذا شفت خطأ:
❌ **فيه مشكلة في RAG API** - شوف الخطأ وابعتهولي

---

## 🧪 الخطوة 4: اختبر الشات (بعد ما كل شيء يشتغل)

### افتح الموقع:
```
https://sck-tawny.vercel.app
```

### امسح Cache أولاً:
```
Ctrl + Shift + R
```

### اختبر الشات:
1. اضغط زر الشات (أسفل يمين)
2. اكتب: "مرحبا"
3. انتظر الرد

### المتوقع:
✅ رد من الـ AI بدون أخطاء

---

## 📊 جدول التشخيص

| الخطوة | API | المتوقع | إذا فشل |
|--------|-----|---------|----------|
| 1 | `/api/test` | `success: true` | Vercel config خطأ |
| 2 | `/api/health` | `status: healthy` | Env vars ناقصة |
| 3 | `/api/rag?action=chat` | `success: true` | RAG API خطأ |
| 4 | Chatbot | رد صحيح | Frontend خطأ |

---

## 🔍 تحليل الأخطاء

### خطأ 1: `/api/test` مش شغال
**السبب:** Vercel مش بيشوف الـ `api/` folder

**الحل:**
1. تأكد أن `api/` folder موجود في الـ root
2. تأكد أن `.vercelignore` مش بيمنع `api/`
3. Redeploy

---

### خطأ 2: Environment variables ناقصة
**السبب:** مش موجودة في Vercel

**الحل:**
1. افتح Vercel Dashboard
2. Settings → Environment Variables
3. أضف:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `HF_API_KEY`
4. Redeploy

---

### خطأ 3: RAG API بترجع خطأ
**السبب:** مشكلة في الكود أو Database

**الحل:**
1. شوف الخطأ في Response
2. افتح Vercel Logs
3. شوف الـ error message
4. ابعتهولي

---

### خطأ 4: الشات مش بيشتغل (لكن API تشتغل)
**السبب:** Frontend cache أو CORS

**الحل:**
1. Hard refresh: `Ctrl + Shift + R`
2. امسح Cache: `Ctrl + Shift + Delete`
3. جرب Incognito: `Ctrl + Shift + N`
4. شوف Console errors

---

## 💡 نصائح مهمة

### 1. اختبر بالترتيب:
```
Test API → Health API → RAG API → Chatbot
```

### 2. لا تتخطى خطوة:
- كل خطوة تعتمد على اللي قبلها
- إذا خطوة فشلت، صلحها قبل ما تكمل

### 3. استخدم Browser Console:
```
F12 → Console → Network
```

### 4. شوف Vercel Logs:
```
Vercel Dashboard → Logs → Real-time
```

---

## 🎯 الخلاصة

### الترتيب الصحيح:

1. ⏳ **انتظر Deploy** (3 دقائق)
2. 🧪 **اختبر Test API** (30 ثانية)
3. 🧪 **اختبر Health API** (30 ثانية)
4. 🧪 **اختبر RAG API** (1 دقيقة)
5. 🧹 **امسح Cache** (30 ثانية)
6. 🧪 **اختبر الشات** (1 دقيقة)

### الوقت الكلي:
⏱️ **6-7 دقائق**

---

## 📞 إذا احتجت مساعدة

### ابعتلي:

1. **Screenshot من كل API:**
   - `/api/test`
   - `/api/health`
   - `/api/rag?action=chat`

2. **Screenshot من Console:**
   - الـ errors
   - الـ Network tab

3. **Screenshot من Vercel:**
   - Deployment status
   - Environment Variables
   - Logs

---

**ابدأ بالخطوة 1!** 🚀

**اختبر كل API!** 🧪

**ثم اختبر الشات!** 💬

**كل شيء هيشتغل!** ✅
