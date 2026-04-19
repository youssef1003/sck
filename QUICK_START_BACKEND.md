# 🚀 دليل البدء السريع - Quick Start Guide

## الخطوة 1: إعداد قاعدة البيانات (5 دقائق) 🗄️

### أ) افتح Supabase Dashboard
1. اذهب إلى: https://supabase.com/dashboard
2. افتح مشروعك: https://kvngmywqilwhyavyjpc.supabase.co

### ب) نفّذ Database Setup
1. من القائمة الجانبية، اختر **SQL Editor**
2. اضغط **New Query**
3. افتح ملف `SETUP_DATABASE.sql` من المشروع
4. انسخ **كل المحتوى** والصقه في SQL Editor
5. اضغط **Run** أو **F5**

### ج) تحقق من النتيجة
يجب أن ترى رسائل مثل:
```
✅ Super Admin created successfully
   Email: admin@sck.com
   Password: scq2025

✅ Database Setup Complete!
Tables created: 4
Super Admins: 1
```

---

## الخطوة 2: تشغيل Backend (2 دقيقة) 🔧

### أ) افتح Terminal في مجلد Backend
```bash
cd backend
```

### ب) تأكد من تثبيت Dependencies
```bash
pip install -r requirements.txt
```

### ج) شغّل Backend Server
```bash
uvicorn main:app --reload
```

### د) تحقق من التشغيل
يجب أن ترى:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### هـ) اختبر API
افتح المتصفح واذهب إلى:
- http://localhost:8000 (يجب أن ترى welcome message)
- http://localhost:8000/docs (Swagger documentation)

---

## الخطوة 3: تشغيل Frontend (2 دقيقة) 💻

### أ) افتح Terminal جديد في مجلد Frontend
```bash
cd frontend
```

### ب) تأكد من تثبيت Dependencies
```bash
npm install
```

### ج) شغّل Frontend Server
```bash
npm run dev
```

### د) تحقق من التشغيل
يجب أن ترى:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## الخطوة 4: اختبار Login (2 دقيقة) 🔐

### أ) افتح المتصفح
اذهب إلى: http://localhost:5173/login

### ب) سجّل دخول بحساب Super Admin
- **Email**: `admin@sck.com`
- **Password**: `scq2025`

### ج) يجب أن يحدث:
1. ✅ تسجيل دخول ناجح
2. ✅ Redirect إلى `/admin/dashboard`
3. ✅ رؤية Admin Dashboard

### د) تحقق من Console
افتح Developer Tools (F12) وتحقق من:
- ✅ لا توجد أخطاء في Console
- ✅ Network tab يظهر API calls ناجحة
- ✅ localStorage يحتوي على:
  - `access_token`
  - `refresh_token`
  - `user_data`

---

## الخطوة 5: اختبار Backend APIs (5 دقائق) 🧪

### استخدم Swagger UI
اذهب إلى: http://localhost:8000/docs

### اختبر Login API:
1. افتح **POST /api/auth/login**
2. اضغط **Try it out**
3. أدخل:
```json
{
  "email": "admin@sck.com",
  "password": "scq2025"
}
```
4. اضغط **Execute**
5. يجب أن ترى Response 200 مع:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": "...",
      "email": "admin@sck.com",
      "role": "admin",
      ...
    }
  }
}
```

### اختبر Admin Stats API:
1. انسخ `access_token` من Response السابق
2. افتح **GET /api/admin/stats**
3. اضغط **Try it out**
4. اضغط على 🔒 (Authorize) في أعلى الصفحة
5. الصق Token في الحقل: `Bearer YOUR_TOKEN_HERE`
6. اضغط **Authorize**
7. ارجع لـ **GET /api/admin/stats**
8. اضغط **Execute**
9. يجب أن ترى Response 200 مع إحصائيات

---

## ✅ إذا كل شيء يعمل

**تهانينا! 🎉**

Backend و Frontend يعملان بنجاح!

**الخطوة التالية:**
أخبرني أن كل شيء يعمل، وسأبدأ بتحديث باقي الصفحات لاستخدام Backend APIs.

---

## ❌ إذا واجهت مشاكل

### مشكلة: Backend لا يعمل

**الحل:**
```bash
# تأكد من Python version
python --version  # يجب أن يكون 3.8+

# أعد تثبيت dependencies
pip install --upgrade -r requirements.txt

# تحقق من .env file
cat backend/.env  # يجب أن يحتوي على Supabase credentials
```

### مشكلة: Frontend لا يعمل

**الحل:**
```bash
# تأكد من Node version
node --version  # يجب أن يكون 16+

# أعد تثبيت dependencies
rm -rf node_modules package-lock.json
npm install

# تحقق من .env file
cat frontend/.env  # يجب أن يحتوي على VITE_API_URL
```

### مشكلة: Login لا يعمل

**الحل:**
1. تحقق من Console في المتصفح (F12)
2. تحقق من Network tab - هل API call يصل للـ Backend؟
3. تحقق من Backend logs - هل يوجد أخطاء؟
4. تحقق من Database - هل Super Admin موجود؟

```sql
-- في Supabase SQL Editor
SELECT * FROM users WHERE email = 'admin@sck.com';
```

### مشكلة: CORS Error

**الحل:**
تأكد من أن `backend/.env` يحتوي على:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

ثم أعد تشغيل Backend.

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. انسخ رسالة الخطأ كاملة
2. انسخ Console logs
3. أخبرني بالمشكلة وسأساعدك! 🚀

---

## 🎯 الخطوات التالية

بعد التأكد من أن كل شيء يعمل:

1. ✅ Database Setup
2. ✅ Backend Running
3. ✅ Frontend Running
4. ✅ Login Working
5. ⏳ تحديث باقي الصفحات (سأقوم بها)
6. ⏳ Testing شامل
7. ⏳ Deployment

**جاهز؟ لنبدأ! 🚀**
