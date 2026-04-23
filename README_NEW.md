# SCK Consulting Platform

## نظرة عامة
منصة SCK للاستشارات الإدارية - نظام شامل لإدارة الاستشارات والعملاء مع لوحة تحكم متقدمة.

## التقنيات المستخدمة
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Deployment**: Vercel
- **Version Control**: GitHub

## الهيكل الجديد
```
sck/
├── api/                    # Vercel Serverless Functions
│   ├── auth/              # Authentication APIs
│   └── admin/             # Admin APIs
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/         # Page Components
│   │   ├── utils/         # Utilities & API Client
│   │   └── i18n/          # Internationalization
│   └── dist/              # Build Output
└── package.json           # API Dependencies
```

## المزايا
✅ **Serverless Architecture** - تكلفة أقل وأداء أفضل  
✅ **Multi-language Support** - العربية والإنجليزية  
✅ **Advanced Admin Panel** - لوحة تحكم شاملة  
✅ **Permission System** - نظام صلاحيات متقدم  
✅ **Responsive Design** - يعمل على جميع الأجهزة  
✅ **JWT Authentication** - نظام أمان قوي  

## بيانات تسجيل الدخول
```
Email: admin@sck.com
Password: scq2025
```

## الروابط المهمة
- **الموقع**: https://sck-tawny.vercel.app
- **لوحة التحكم**: https://sck-tawny.vercel.app/login
- **GitHub**: [Repository Link]
- **Supabase**: https://kvngmywqilwhyavyjpc.supabase.co

## APIs المتاحة

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/refresh` - تجديد التوكن
- `GET /api/auth/me` - معلومات المستخدم

### Admin
- `GET /api/admin/stats` - إحصائيات لوحة التحكم
- `GET /api/admin/users` - إدارة المستخدمين

## التطوير المحلي

### متطلبات النظام
- Node.js 18+
- npm أو yarn

### تشغيل المشروع محلياً
```bash
# تثبيت dependencies للـ API
npm install

# تثبيت dependencies للـ Frontend
cd frontend
npm install

# تشغيل Frontend
npm run dev

# تشغيل Vercel Functions محلياً (في terminal منفصل)
cd ..
npx vercel dev
```

## النشر

### 1. رفع على GitHub
```bash
git add .
git commit -m "Update project"
git push origin main
```

### 2. إعداد Vercel
1. ربط Repository بـ Vercel
2. إضافة Environment Variables
3. Deploy تلقائياً

### 3. Environment Variables المطلوبة
```
SUPABASE_URL=https://kvngmywqilwhyavyjpc.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## قاعدة البيانات

### الجداول الرئيسية
- `users` - المستخدمون والإدارة
- `admin_permissions` - صلاحيات المساعدين
- `consultation_bookings` - حجوزات الاستشارات
- `contact_requests` - رسائل التواصل
- `blog_posts` - مقالات المدونة
- `job_applications` - طلبات التوظيف

### إعداد قاعدة البيانات
شغل الكود من `MISSING_TABLES_MIGRATION.sql` في Supabase SQL Editor.

## الاختبار

### اختبار APIs
```bash
# تشغيل اختبار شامل
node test-vercel-api.js
```

### اختبار يدوي
1. اذهب إلى https://sck-tawny.vercel.app
2. سجل دخول بالبيانات المذكورة أعلاه
3. تحقق من عمل جميع الصفحات

## الصفحات المتاحة

### للمستخدمين العاديين
- الصفحة الرئيسية
- الخدمات
- من نحن
- التواصل
- المدونة
- الوظائف

### لوحة التحكم (الإدارة)
- لوحة التحكم الرئيسية
- إدارة المستخدمين
- إدارة الحجوزات
- إدارة الرسائل
- إدارة المدونة
- إدارة المساعدين
- إدارة أصحاب العمل
- تحرير الصفحة الرئيسية

## الدعم الفني
للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

---

**تم تطوير هذا المشروع بعناية فائقة لضمان الجودة والأداء الأمثل 🚀**