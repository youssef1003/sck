# إعداد متغيرات البيئة في Vercel

## ⚠️ مهم جداً

لكي تعمل الإحصائيات الحقيقية، يجب إضافة متغيرات البيئة في Vercel.

---

## 📋 الخطوات

### 1. الدخول إلى لوحة تحكم Vercel
1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع `sck`
3. اضغط على `Settings`
4. اضغط على `Environment Variables`

### 2. إضافة المتغيرات التالية

#### المتغير الأول: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://kvngmywqilwhyavyjpc.supabase.co`
- **Environment:** Production, Preview, Development (اختر الكل)

#### المتغير الثاني: SUPABASE_SERVICE_KEY
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** `[احصل عليه من Supabase Dashboard]`
- **Environment:** Production, Preview, Development (اختر الكل)

**كيفية الحصول على SUPABASE_SERVICE_KEY:**
1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى `Settings` → `API`
4. انسخ `service_role key` (⚠️ ليس anon key)

#### المتغير الثالث: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `sck-consulting-super-secret-jwt-key-production-2024-min-32-chars`
- **Environment:** Production, Preview, Development (اختر الكل)

### 3. إعادة نشر المشروع
بعد إضافة المتغيرات:
1. اذهب إلى `Deployments`
2. اضغط على آخر deployment
3. اضغط على `...` (ثلاث نقاط)
4. اختر `Redeploy`

---

## ✅ التحقق من نجاح الإعداد

بعد إعادة النشر:
1. سجل دخول إلى لوحة التحكم: https://sck-tawny.vercel.app/login
2. البيانات: admin@sck.com / scq2025
3. تحقق من الإحصائيات في Dashboard

### النتيجة المتوقعة:
- إذا كانت قاعدة البيانات فارغة: ستظهر جميع الإحصائيات = **0**
- إذا كانت هناك بيانات: ستظهر الأرقام الحقيقية

---

## 🔍 استكشاف الأخطاء

### المشكلة: الإحصائيات تظهر 0 دائماً
**الحل:**
1. تأكد من إضافة جميع المتغيرات الثلاثة
2. تأكد من أن `SUPABASE_SERVICE_KEY` صحيح (ليس anon key)
3. تأكد من إعادة نشر المشروع بعد إضافة المتغيرات

### المشكلة: خطأ في تسجيل الدخول
**الحل:**
- تأكد من أن `JWT_SECRET` نفس القيمة المستخدمة في الكود
- القيمة الصحيحة: `sck-consulting-super-secret-jwt-key-production-2024-min-32-chars`

### المشكلة: Database connection error
**الحل:**
1. تحقق من أن `SUPABASE_URL` صحيح
2. تحقق من أن قاعدة البيانات في Supabase تعمل
3. تحقق من أن الجداول موجودة (users, consultation_bookings, إلخ)

---

## 📊 اختبار قاعدة البيانات

### إضافة بيانات تجريبية:

#### 1. إضافة مستخدم جديد:
```sql
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'test@example.com',
  crypt('password123', gen_salt('bf', 10)),
  'Test User',
  'client'
);
```

#### 2. إضافة حجز:
```sql
INSERT INTO consultation_bookings (name, email, phone, service_type, status)
VALUES (
  'أحمد محمد',
  'ahmed@example.com',
  '+966501234567',
  'استشارات إدارية',
  'pending'
);
```

#### 3. إضافة رسالة:
```sql
INSERT INTO contact_requests (name, email, phone, business_type, message, status)
VALUES (
  'محمد علي',
  'mohamed@example.com',
  '+966501234567',
  'شركة صغيرة',
  'أريد استشارة',
  'new'
);
```

بعد إضافة هذه البيانات، ستظهر في لوحة التحكم:
- المستخدمون: 2 (admin + test user)
- الحجوزات: 1
- الرسائل: 1
- الرسائل الجديدة: 1
- الحجوزات المعلقة: 1

---

## 🎯 الخلاصة

**الخطوات المطلوبة:**
1. ✅ إضافة 3 متغيرات بيئة في Vercel
2. ✅ إعادة نشر المشروع
3. ✅ التحقق من عمل الإحصائيات

**النتيجة:**
- الإحصائيات ستكون حقيقية 100%
- لو مفيش بيانات = صفر
- لو في بيانات = الأرقام الحقيقية

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Vercel Logs: `Deployments` → اختر deployment → `View Function Logs`
2. ابحث عن أي errors في الـ logs
3. تأكد من أن جميع المتغيرات موجودة وصحيحة
