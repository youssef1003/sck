-- تحقق من أن عمود booking_link موجود وشاهد البيانات الحالية
-- Verify booking_link column exists and view current data

-- 1. عرض جميع المقالات مع روابط الحجز
-- Show all blog posts with their booking links
SELECT 
  id,
  title,
  booking_link,
  is_published,
  created_at
FROM blog_posts
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- 2. عرض المقالات التي ليس لها رابط حجز
-- Show posts without booking link
SELECT 
  id,
  title,
  booking_link
FROM blog_posts
WHERE deleted_at IS NULL 
  AND (booking_link IS NULL OR booking_link = '')
ORDER BY created_at DESC;

-- 3. عرض المقالات حسب نوع رابط الحجز
-- Show posts grouped by booking link type
SELECT 
  booking_link,
  COUNT(*) as count
FROM blog_posts
WHERE deleted_at IS NULL
GROUP BY booking_link
ORDER BY count DESC;
