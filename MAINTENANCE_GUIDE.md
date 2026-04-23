# دليل الصيانة والمراقبة

## 🔍 مراقبة النظام

### Health Check تلقائي:
```bash
# اختبار صحة النظام
curl https://sck-tawny.vercel.app/api/health
```

### مراقبة الأداء:
- **Vercel Analytics**: تلقائي في Dashboard
- **Supabase Monitoring**: في Supabase Dashboard → Settings → Usage

## 💾 النسخ الاحتياطية

### تلقائي من لوحة التحكم:
1. سجل دخول كـ Super Admin
2. اذهب إلى لوحة التحكم
3. اضغط "نسخ احتياطي" في قسم الإدارة المتقدمة

### يدوي عبر API:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://sck-tawny.vercel.app/api/admin/backup \
  -o backup-$(date +%Y-%m-%d).json
```

## 📊 مراقبة الاستخدام

### Vercel Limits (الخطة المجانية):
- **Bandwidth**: 100GB/شهر
- **Function Executions**: 100,000/شهر
- **Build Minutes**: 6,000 دقيقة/شهر

### Supabase Limits (الخطة المجانية):
- **Database Size**: 500MB
- **Monthly Active Users**: 50,000
- **API Requests**: 500,000/شهر

## 🚨 التنبيهات

### إعداد تنبيهات Vercel:
1. اذهب إلى Project Settings → Integrations
2. أضف Slack أو Discord للتنبيهات
3. فعل تنبيهات الأخطاء والاستخدام

### إعداد تنبيهات Supabase:
1. اذهب إلى Project Settings → Integrations
2. أضف Webhook للتنبيهات
3. راقب Database Usage

## 🔧 الصيانة الدورية

### أسبوعياً:
- [ ] تحقق من Function Logs في Vercel
- [ ] راجع Database Usage في Supabase
- [ ] اختبر تسجيل الدخول والوظائف الأساسية

### شهرياً:
- [ ] تحميل نسخة احتياطية
- [ ] مراجعة الأداء والاستخدام
- [ ] تحديث Dependencies إذا لزم الأمر

### عند الحاجة:
- [ ] تنظيف البيانات القديمة
- [ ] تحسين الاستعلامات البطيئة
- [ ] تحديث Environment Variables

## 🛠️ استكشاف الأخطاء

### إذا توقف الموقع:
1. تحقق من Vercel Status
2. راجع Function Logs
3. اختبر Supabase Connection

### إذا بطء الأداء:
1. راجع Database Queries في Supabase
2. تحقق من Indexes
3. راجع Function Response Times

### إذا امتلأت المساحة:
1. نظف البيانات القديمة
2. ضغط الصور والملفات
3. فكر في الترقية للخطة المدفوعة

## 📈 التوسع المستقبلي

### عند الحاجة للترقية:

#### Vercel Pro ($20/شهر):
- Bandwidth غير محدود
- Function Executions غير محدود
- Advanced Analytics

#### Supabase Pro ($25/شهر):
- Database Size: 8GB
- Monthly Active Users: 100,000
- Daily Backups

## 🔐 الأمان

### مراجعة دورية:
- [ ] تحديث كلمات المرور
- [ ] مراجعة صلاحيات المستخدمين
- [ ] تحقق من Function Logs للأنشطة المشبوهة

### أفضل الممارسات:
- استخدم كلمات مرور قوية
- فعل Two-Factor Authentication
- راجع Access Logs بانتظام

---

**مع هذا النظام، موقعك سيعمل باستقرار عالي لسنوات قادمة! 🚀**