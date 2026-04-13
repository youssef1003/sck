# دليل تسجيل الدخول | Login Guide

## 🔐 صفحة تسجيل دخول واحدة للجميع

### المسار | Route
```
/login
```

---

## 👤 للمستخدمين العاديين | For Regular Users

### التسجيل أولاً | Register First
1. اذهب إلى `/register`
2. املأ النموذج بالبيانات
3. سيتم تسجيل الدخول تلقائياً

### تسجيل الدخول | Login
1. اذهب إلى `/login`
2. أدخل البريد الإلكتروني وكلمة المرور
3. سيتم التوجيه إلى `/dashboard`

**مثال:**
```
Email: user@example.com
Password: 123456
→ يوجه إلى /dashboard
```

---

## 👨‍💼 للإدارة | For Admin

### تسجيل الدخول | Login
1. اذهب إلى `/login` (نفس الصفحة)
2. أدخل بيانات الإدارة:
   - **Email/Username**: `admin`
   - **Password**: `scq2025`
3. سيتم التوجيه إلى `/admin/dashboard`

**بيانات الدخول:**
```
Email: admin
Password: scq2025
→ يوجه إلى /admin/dashboard
```

---

## 🎯 كيف يعمل النظام | How It Works

```javascript
// عند تسجيل الدخول
if (email === 'admin' && password === 'scq2025') {
  // توجيه للإدارة
  navigate('/admin/dashboard')
} else {
  // البحث في قاعدة المستخدمين
  const user = users.find(u => u.email === email && u.password === password)
  if (user) {
    // توجيه للمستخدم العادي
    navigate('/dashboard')
  } else {
    // خطأ في البيانات
    showError('Invalid credentials')
  }
}
```

---

## 📊 الفرق بين النظامين | Difference

| المستخدم العادي | الإدارة |
|-----------------|---------|
| يسجل من `/register` | بيانات ثابتة |
| `/dashboard` | `/admin/dashboard` |
| يشوف بياناته فقط | يشوف كل البيانات |
| يقدم طلبات | يدير الطلبات |

---

## ✅ تم الاختبار | Tested

- ✅ تسجيل دخول مستخدم عادي → `/dashboard`
- ✅ تسجيل دخول أدمن → `/admin/dashboard`
- ✅ بيانات خاطئة → رسالة خطأ
- ✅ البناء بدون أخطاء

---

## 🚀 للاستخدام الفوري | Quick Start

### مستخدم جديد:
1. `/register` → سجل حساب
2. `/login` → سجل دخول
3. `/dashboard` → شوف بياناتك

### الإدارة:
1. `/login`
2. أدخل: `admin` / `scq2025`
3. `/admin/dashboard` → إدارة كاملة

---

**كل شيء يعمل من صفحة واحدة! ✅**
