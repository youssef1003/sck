-- إضافة حقل رابط حجز الاستشارة لجدول المقالات
-- Add booking link field to blog_posts table

-- إضافة العمود إذا لم يكن موجوداً
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS booking_link TEXT;

-- تحديث المقالات الموجودة بالرابط الافتراضي
UPDATE blog_posts 
SET booking_link = '/consultation'
WHERE booking_link IS NULL;

-- إضافة تعليق على العمود
COMMENT ON COLUMN blog_posts.booking_link IS 'رابط مباشر لحجز استشارة من المقال';

-- عرض النتيجة
SELECT 
    'تم إضافة حقل booking_link بنجاح' as status,
    COUNT(*) as total_posts,
    COUNT(booking_link) as posts_with_link
FROM blog_posts
WHERE deleted_at IS NULL;
