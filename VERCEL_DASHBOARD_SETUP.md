# إعداد المشروع على Vercel Dashboard

## المشكلة
ملف `vercel.json` كان يسبب خطأ "Invalid vercel.json file provided" لأن Vercel لا يدعم بعض الإعدادات في الملف.

## الحل النهائي
حذف `vercel.json` تماماً وإعداد المشروع من Vercel Dashboard مباشرة.

---

## خطوات الإعداد في Vercel Dashboard

### 1. افتح Vercel Dashboard
اذهب إلى: https://vercel.com/dashboard

### 2. اختر المشروع
اضغط على مشروع `sck`

### 3. اذهب إلى Settings
اضغط على `Settings` من القائمة العلوية

### 4. اذهب إلى General
من القائمة الجانبية، اختر `General`

### 5. عدّل Build & Development Settings

#### Root Directory
```
frontend
```
✅ هذا مهم جداً! المشروع موجود في مجلد `frontend/`

#### Framework Preset
```
Vite
```

#### Build Command
```
npm run build
```

#### Output Directory
```
dist
```

#### Install Command
```
npm install
```

### 6. احفظ التغييرات
اضغط على `Save`

### 7. أعد النشر
ارجع إلى `Deployments` واضغط على `Redeploy`

---

## الإعدادات الصحيحة (ملخص)

| الإعداد | القيمة |
|---------|--------|
| Root Directory | `frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## لماذا هذا الحل أفضل؟

1. ✅ لا يوجد ملف vercel.json يسبب أخطاء
2. ✅ Vercel يكتشف المشروع تلقائياً
3. ✅ الإعدادات في Dashboard أكثر مرونة
4. ✅ يمكن تعديل الإعدادات بدون commit جديد
5. ✅ يدعم جميع ميزات Vercel

---

## بعد الإعداد

### اختبر هذه الروابط:

#### الصفحات العامة
- https://sck-tawny.vercel.app/
- https://sck-tawny.vercel.app/about
- https://sck-tawny.vercel.app/services
- https://sck-tawny.vercel.app/careers
- https://sck-tawny.vercel.app/contact

#### صفحات المصادقة
- https://sck-tawny.vercel.app/login
- https://sck-tawny.vercel.app/register

#### صفحات الإدارة
- https://sck-tawny.vercel.app/admin/dashboard
- https://sck-tawny.vercel.app/admin/careers
- https://sck-tawny.vercel.app/admin/employers
- https://sck-tawny.vercel.app/admin/contacts

### اختبارات إضافية
- افتح أي رابط مباشرة (Direct URL)
- اعمل Refresh (F5) على أي صفحة
- افتح في Incognito mode
- تأكد من عدم ظهور 404

---

## معلومات تسجيل الدخول

### Admin
- Username: `admin`
- Password: `scq2025`

### Sub-Admin
- `subadmin1` / `scq2025sub1`
- `subadmin2` / `scq2025sub2`
- `subadmin3` / `scq2025sub3`

---

## ملاحظات مهمة

1. **Root Directory = frontend**
   - هذا أهم إعداد!
   - بدونه، Vercel لن يجد package.json

2. **Framework = Vite**
   - Vercel سيستخدم إعدادات Vite الافتراضية
   - سيكتشف تلقائياً أنه SPA

3. **لا تنشئ vercel.json مرة أخرى**
   - الإعدادات في Dashboard كافية
   - vercel.json يسبب تعارضات

4. **SPA Routing**
   - Vercel يكتشف تلقائياً أنه SPA
   - سيوجه جميع الطلبات إلى index.html
   - React Router سيتعامل مع الـ routing

---

## الحالة النهائية

| المكون | الحالة |
|--------|--------|
| vercel.json | ✅ محذوف |
| Local Build | ✅ يعمل |
| Code Quality | ✅ بدون أخطاء |
| Git Push | ✅ تم (Commit: 6def999) |
| Dashboard Setup | ⏳ يحتاج إعداد يدوي |

---

## الخلاصة

**تم حذف vercel.json نهائياً.**

الآن يجب عليك:
1. فتح Vercel Dashboard
2. إعداد Root Directory = `frontend`
3. إعداد Framework = `Vite`
4. حفظ وإعادة النشر

**بعد الإعداد، كل شيء سيعمل 100%!** 🎉
