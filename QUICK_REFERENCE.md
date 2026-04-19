# 🚀 مرجع سريع - Quick Reference Card

## 🔑 بيانات الدخول - Login Credentials

### Super Admin
```
URL: http://localhost:5173/login
Username: admin
Password: scq2025
```

### Sub-Admin (مثال)
```
يتم إنشاؤه من قبل Super Admin
Username: [حسب الإنشاء]
Password: [حسب الإنشاء]
```

---

## 📍 الروابط المهمة - Important Links

| الصفحة | الرابط | الصلاحية المطلوبة |
|--------|--------|-------------------|
| لوحة التحكم | `/admin/dashboard` | الكل |
| إدارة المساعدين | `/admin/subadmins` | Super Admin فقط |
| المستخدمون | `/admin/users` | users_view |
| الحجوزات | `/admin/bookings` | bookings_view |
| التوظيف | `/admin/careers` | careers_view |
| أصحاب العمل | `/admin/employers` | employers_view |
| الصفحة الرئيسية | `/admin/home` | home_edit |
| الرسائل | `/admin/contacts` | messages_view |
| المدونة | `/admin/blog` | blog_view |

---

## 🎯 الصلاحيات الأساسية - Core Permissions

### عرض (View)
- `users_view` - عرض المستخدمين
- `bookings_view` - عرض الحجوزات
- `messages_view` - عرض الرسائل
- `blog_view` - عرض المقالات
- `careers_view` - عرض طلبات التوظيف
- `employers_view` - عرض أصحاب العمل

### تعديل (Edit)
- `users_edit` - تعديل المستخدمين
- `bookings_edit` - تعديل الحجوزات
- `messages_edit` - تعديل الرسائل
- `blog_edit` - تعديل المقالات
- `careers_edit` - تعديل طلبات التوظيف
- `home_edit` - تعديل الصفحة الرئيسية

### حذف (Delete)
- `users_delete` - حذف المستخدمين
- `bookings_delete` - حذف الحجوزات
- `messages_delete` - حذف الرسائل
- `blog_delete` - حذف المقالات
- `careers_delete` - حذف طلبات التوظيف
- `employers_delete` - حذف أصحاب العمل

### إنشاء (Create)
- `users_create` - إضافة مستخدمين
- `blog_create` - إنشاء مقالات
- `subadmins_create` - إضافة مساعدين (Super Admin)

### خاص (Special)
- `users_change_role` - تغيير أدوار المستخدمين
- `bookings_change_status` - تغيير حالة الحجز
- `messages_change_status` - تغيير حالة الرسالة
- `careers_change_status` - تغيير حالة طلب التوظيف
- `blog_publish` - نشر/إلغاء نشر المقالات
- `employers_approve` - الموافقة على أصحاب العمل
- `employers_reject` - رفض أصحاب العمل

---

## 💻 أكواد سريعة - Quick Code Snippets

### 1. إخفاء زر بناءً على صلاحية
```jsx
import PermissionGuard from '@/components/admin/PermissionGuard'
import { PERMISSIONS } from '@/utils/permissions'

<PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
  <button>حذف المستخدم</button>
</PermissionGuard>
```

### 2. إخفاء زر مع بديل
```jsx
<PermissionGuard 
  permission={PERMISSIONS.USERS_EDIT}
  fallback={<span className="text-gray-500">للعرض فقط</span>}
>
  <button>تعديل</button>
</PermissionGuard>
```

### 3. التحقق من أي صلاحية
```jsx
<PermissionGuard anyOf={[PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_DELETE]}>
  <button>إدارة المستخدم</button>
</PermissionGuard>
```

### 4. Super Admin فقط
```jsx
<PermissionGuard superAdminOnly>
  <button>إعدادات متقدمة</button>
</PermissionGuard>
```

### 5. حماية مسار
```jsx
<Route path="/admin/users" element={
  <AdminRoute anyOf={['users_view', 'users_edit']}>
    <UsersManagement />
  </AdminRoute>
} />
```

### 6. التحقق في JavaScript
```jsx
import { hasPermission, getCurrentUserPermissions, PERMISSIONS } from '@/utils/permissions'

const userPermissions = getCurrentUserPermissions()
const canDelete = hasPermission(userPermissions, PERMISSIONS.USERS_DELETE)

if (canDelete) {
  // يمكن الحذف
}
```

---

## 🔧 localStorage Commands

### عرض جميع Sub-Admins
```javascript
console.log(JSON.parse(localStorage.getItem('scq_admin_users')))
```

### عرض المستخدم الحالي
```javascript
console.log(JSON.parse(localStorage.getItem('admin_user')))
```

### عرض صلاحيات المستخدم الحالي
```javascript
const user = JSON.parse(localStorage.getItem('admin_user'))
console.log('Permissions:', user.permissions)
```

### مسح جميع البيانات
```javascript
localStorage.clear()
```

### حذف Sub-Admins فقط
```javascript
localStorage.removeItem('scq_admin_users')
```

---

## 📋 سيناريوهات شائعة - Common Scenarios

### سيناريو 1: Sub-Admin لإدارة المحتوى
**الصلاحيات**:
- ✅ `home_edit`
- ✅ `blog_view`, `blog_create`, `blog_edit`, `blog_publish`

**النتيجة**: يمكنه تعديل الصفحة الرئيسية وإدارة المدونة فقط

---

### سيناريو 2: Sub-Admin لخدمة العملاء
**الصلاحيات**:
- ✅ `bookings_view`, `bookings_change_status`
- ✅ `messages_view`, `messages_change_status`
- ✅ `careers_view`

**النتيجة**: يمكنه إدارة الحجوزات والرسائل وعرض طلبات التوظيف

---

### سيناريو 3: Sub-Admin للموارد البشرية
**الصلاحيات**:
- ✅ `careers_view`, `careers_edit`, `careers_change_status`
- ✅ `employers_view`, `employers_approve`, `employers_reject`

**النتيجة**: يمكنه إدارة التوظيف وأصحاب العمل فقط

---

### سيناريو 4: Sub-Admin للعرض فقط
**الصلاحيات**:
- ✅ `users_view`
- ✅ `bookings_view`
- ✅ `messages_view`
- ✅ `blog_view`
- ✅ `careers_view`

**النتيجة**: يمكنه عرض البيانات فقط بدون تعديل أو حذف

---

## 🐛 حل المشاكل - Troubleshooting

### المشكلة: Sub-Admin يرى جميع الأقسام
**الحل**:
1. سجل خروج
2. سجل دخول مرة أخرى
3. امسح localStorage إذا استمرت المشكلة

### المشكلة: لا يمكن الوصول لأي صفحة
**الحل**:
1. تأكد من أن Sub-Admin لديه صلاحية واحدة على الأقل
2. تحقق من أن الحساب نشط (isActive: true)

### المشكلة: التعديلات لا تظهر
**الحل**:
1. سجل خروج
2. سجل دخول مرة أخرى
3. الصلاحيات تُحمّل عند تسجيل الدخول فقط

### المشكلة: Build يفشل
**الحل**:
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

---

## 📞 الملفات المرجعية - Reference Files

| الملف | الوصف |
|-------|-------|
| `PERMISSIONS_SYSTEM.md` | التوثيق الكامل للنظام |
| `TEST_PERMISSIONS.md` | دليل الاختبار الشامل |
| `IMPLEMENTATION_COMPLETE.md` | ملخص التطبيق |
| `QUICK_REFERENCE.md` | هذا الملف - مرجع سريع |

---

## ⚡ أوامر سريعة - Quick Commands

### تشغيل المشروع
```bash
cd frontend
npm run dev
```

### Build للإنتاج
```bash
cd frontend
npm run build
```

### تنظيف Build
```bash
cd frontend
npm run clean
```

---

## 🎯 نقاط مهمة - Key Points

1. ✅ Super Admin له كل الصلاحيات
2. ✅ Sub-Admin له صلاحيات مخصصة
3. ✅ الصلاحيات تُحمّل عند تسجيل الدخول
4. ✅ القائمة الجانبية ديناميكية
5. ✅ الأزرار تُخفى بناءً على الصلاحيات
6. ✅ المسارات محمية
7. ✅ عدد غير محدود من Sub-Admins
8. ⚠️ يحتاج Backend للإنتاج الفعلي

---

## 🚀 البدء السريع - Quick Start

```bash
# 1. تشغيل المشروع
cd frontend
npm run dev

# 2. فتح المتصفح
http://localhost:5173

# 3. تسجيل الدخول
Username: admin
Password: scq2025

# 4. إنشاء Sub-Admin
الانتقال إلى: /admin/subadmins
اضغط: إضافة مساعد جديد
املأ البيانات وحدد الصلاحيات
احفظ

# 5. اختبار Sub-Admin
سجل خروج
سجل دخول بحساب Sub-Admin
تحقق من الأقسام المتاحة
```

---

**تم إنشاء هذا المرجع لتسهيل الاستخدام السريع للنظام** ✨

**بالتوفيق! 🎉**
