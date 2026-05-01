-- إضافة عمود button_text لتخصيص نص الزر لكل مقال
-- Add button_text column to customize button text for each article

-- 1. إضافة العمود
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'احجز استشارة';

-- 2. تحديث النصوص الافتراضية حسب الرابط الموجود
-- Update default texts based on existing booking_link

-- للاستشارات
UPDATE blog_posts 
SET button_text = 'احجز استشارة'
WHERE booking_link = '/consultation' 
  AND (button_text IS NULL OR button_text = '');

-- لطلب موظفين
UPDATE blog_posts 
SET button_text = 'اطلب موظفين'
WHERE booking_link = '/employer-request' 
  AND (button_text IS NULL OR button_text = '');

-- للوظائف
UPDATE blog_posts 
SET button_text = 'قدم طلبك الآن'
WHERE booking_link = '/careers' 
  AND (button_text IS NULL OR button_text = '');

-- للتواصل
UPDATE blog_posts 
SET button_text = 'تواصل معنا'
WHERE booking_link = '/contact' 
  AND (button_text IS NULL OR button_text = '');

-- للخدمات
UPDATE blog_posts 
SET button_text = 'اعرف المزيد'
WHERE booking_link = '/services' 
  AND (button_text IS NULL OR button_text = '');

-- لمن نحن
UPDATE blog_posts 
SET button_text = 'تعرف علينا'
WHERE booking_link = '/about' 
  AND (button_text IS NULL OR button_text = '');

-- 3. تحديث المقالات اللي ملهاش button_text
UPDATE blog_posts 
SET button_text = 'احجز استشارة'
WHERE button_text IS NULL OR button_text = '';

-- 4. عرض النتيجة
SELECT 
  id,
  title,
  booking_link,
  button_text,
  updated_at
FROM blog_posts
WHERE deleted_at IS NULL
ORDER BY created_at DESC;
