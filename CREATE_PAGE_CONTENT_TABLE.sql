-- إنشاء جدول محتوى الصفحات
-- Create page_content table for dynamic content management

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key VARCHAR(50) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة trigger للـ updated_at
DROP TRIGGER IF EXISTS trigger_page_content_updated_at ON page_content;
CREATE TRIGGER trigger_page_content_updated_at 
    BEFORE UPDATE ON page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- إضافة محتوى صفحة "من نحن" الافتراضي
INSERT INTO page_content (page_key, content)
VALUES (
    'about',
    '{
        "title_ar": "من نحن",
        "title_en": "About Us",
        "subtitle_ar": "SCQ للاستشارات الإدارية",
        "subtitle_en": "SCQ Management Consulting",
        "description_ar": "نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة. نحن شركة رائدة في مجال الاستشارات الإدارية مع خبرة تمتد لأكثر من 25 عاماً في تقديم حلول مبتكرة للشركات والمؤسسات.",
        "description_en": "At SCQ, we believe that every company has the ability to grow with the right strategy. We are a leading management consulting firm with over 25 years of experience in providing innovative solutions for companies and organizations.",
        "mission_ar": "مهمتنا هي مساعدة المؤسسات على تحقيق التميز التشغيلي والنمو المستدام من خلال حلول استشارية مبتكرة تعتمد على أفضل الممارسات العالمية.",
        "mission_en": "Our mission is to help organizations achieve operational excellence and sustainable growth through innovative consulting solutions based on global best practices.",
        "vision_ar": "أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط تحول كيفية نمو الشركات واتخاذ القرارات الاستراتيجية.",
        "vision_en": "To become a leading digital consulting platform in the Middle East that transforms how companies grow and make strategic decisions.",
        "values_ar": ["التميز", "الابتكار", "النزاهة", "الشراكة", "النتائج"],
        "values_en": ["Excellence", "Innovation", "Integrity", "Partnership", "Results"],
        "years_experience": "25+",
        "clients_count": "500+",
        "projects_count": "1000+",
        "team_size": "50+",
        "hero_image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
        "about_image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    }'::jsonb
)
ON CONFLICT (page_key) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);

-- عرض النتيجة
SELECT 
    'تم إنشاء جدول page_content بنجاح ✅' as status,
    COUNT(*) as total_pages
FROM page_content;
