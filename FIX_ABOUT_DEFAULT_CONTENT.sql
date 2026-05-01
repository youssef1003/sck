-- إضافة المحتوى الافتراضي لصفحة "من نحن"
-- Add default content for About page

-- حذف المحتوى القديم إن وجد
DELETE FROM page_content WHERE page_key = 'about';

-- إضافة المحتوى الكامل
INSERT INTO page_content (page_key, content)
VALUES (
    'about',
    '{
        "title_ar": "من نحن",
        "title_en": "About Us",
        "subtitle_ar": "SCQ للاستشارات الإدارية",
        "subtitle_en": "SCQ Management Consulting",
        "description_ar": "نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة. نحن شركة رائدة في مجال الاستشارات الإدارية مع خبرة تمتد لأكثر من 25 عاماً في تقديم حلول مبتكرة للشركات والمؤسسات في جميع أنحاء المنطقة.",
        "description_en": "At SCQ, we believe that every company has the ability to grow with the right strategy. We are a leading management consulting firm with over 25 years of experience in providing innovative solutions for companies and organizations across the region.",
        "mission_ar": "مهمتنا هي مساعدة المؤسسات على تحقيق التميز التشغيلي والنمو المستدام من خلال حلول استشارية مبتكرة تعتمد على أفضل الممارسات العالمية وأحدث التقنيات والبيانات.",
        "mission_en": "Our mission is to help organizations achieve operational excellence and sustainable growth through innovative consulting solutions based on global best practices and the latest technologies and data.",
        "vision_ar": "أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط تحول كيفية نمو الشركات واتخاذ القرارات الاستراتيجية وتحقيق التميز المؤسسي.",
        "vision_en": "To become a leading digital consulting platform in the Middle East that transforms how companies grow, make strategic decisions, and achieve organizational excellence.",
        "values_ar": ["التميز", "الابتكار", "النزاهة", "الشراكة", "النتائج"],
        "values_en": ["Excellence", "Innovation", "Integrity", "Partnership", "Results"],
        "years_experience": "25+",
        "clients_count": "500+",
        "projects_count": "1000+",
        "team_size": "50+",
        "hero_image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
        "hero_image_caption_ar": "مقر الشركة الرئيسي",
        "hero_image_caption_en": "Company Headquarters",
        "about_image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        "about_image_caption_ar": "فريق العمل",
        "about_image_caption_en": "Our Team"
    }'::jsonb
);

-- التحقق من النتيجة
SELECT 
    'تم إضافة المحتوى الافتراضي بنجاح! ✅' as status,
    page_key,
    content->>'title_ar' as title_ar,
    content->>'description_ar' as description_ar,
    content->>'mission_ar' as mission_ar,
    content->>'vision_ar' as vision_ar
FROM page_content
WHERE page_key = 'about';
