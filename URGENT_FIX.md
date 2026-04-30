# 🚨 إصلاح عاجل - API لا يعمل!

## ❌ المشكلة

من الصور:
1. ❌ Login يرجع 401 Unauthorized
2. ❌ Chatbot يرجع "Sorry, I encountered an error"
3. ❌ API endpoints ترجع HTML بدلاً من JSON

**السبب:** Vercel routing مش شغال صح!

---

## ✅ الحل

تم إصلاح `vercel.json` بالكامل.

---

## 🚀 الخطوات (خطوتين فقط!)

### 1️⃣ Redeploy من Vercel Dashboard

**مهم جداً:** يجب عمل Redeploy يدوي!

```
1. افتح: https://vercel.com/dashboard
2. اختر: sck
3. اذهب إلى: Deployments
4. اضغط على آخر deployment
5. اضغط: ... (ثلاث نقاط)
6. اختر: Redeploy
7. اختار: Use existing Build Cache = NO ❌
8. اضغط: Redeploy
```

**انتظر حتى Status: Ready ✅ (2-3 دقائق)**

---

### 2️⃣ اختبر بعد Redeploy

```
1. اضغط: Ctrl + Shift + Delete (امسح كل الـ Cache!)
2. افتح: https://sck-tawny.vercel.app/api/health
   يجب أن يرجع: {"status": "healthy", ...}
3. افتح: https://sck-tawny.vercel.app/login
4. سجل دخول: admin@sck.com / scq2025
```

---

## 🔍 ما تم إصلاحه

### في `vercel.json`:

1. ✅ إضافة `"version": 2`
2. ✅ إضافة `"functions"` configuration
3. ✅ تحديد `runtime: nodejs18.x`
4. ✅ إصلاح `rewrites` (استثناء `/api`)
5. ✅ تحسين CORS headers

---

## ✅ المتوقع بعد Redeploy

- ✅ `/api/health` يرجع JSON
- ✅ Login يعمل
- ✅ Dashboard يفتح
- ✅ Chatbot يرد
- ✅ مفيش 401 errors

---

## 🐛 إذا لسه مش شغال

### تحقق من Environment Variables:

```
1. Vercel Dashboard → sck → Settings
2. Environment Variables
3. تأكد من:
   ✅ SUPABASE_URL
   ✅ SUPABASE_SERVICE_KEY
   ✅ JWT_SECRET
   ✅ HF_API_KEY (اختياري)
```

### إذا ناقصة:
```
1. اضغط: Add New
2. اكتب: Name و Value
3. اضغط: Save
4. Redeploy مرة تانية
```

---

## 📝 ملاحظات مهمة

1. **يجب عمل Redeploy يدوي** من Vercel Dashboard
2. **Use existing Build Cache = NO** (مهم!)
3. **امسح Browser Cache** بعد Redeploy
4. **اختبر `/api/health` أولاً** قبل Login

---

# 🚀 ابدأ الآن!

**افتح Vercel Dashboard واعمل Redeploy!**

```
https://vercel.com/dashboard
```

**بعد Redeploy، اختبر:**
```
https://sck-tawny.vercel.app/api/health
```

**يجب أن يرجع JSON وليس HTML!**
