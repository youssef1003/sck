-- ============================================================
-- SCQ GROUP - Complete Supabase Schema (Single File)
-- Version: 2026-05-03
-- Purpose: Fresh minimal production launch schema
-- Notes:
-- 1) This file creates all required public tables, functions, indexes, seed data, RLS policies, and optional storage buckets.
-- 2) It does NOT drop auth or storage schemas.
-- 3) It does NOT include real passwords or secrets.
-- 4) If you want a clean start, run the public schema reset separately before this file.
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 0 - EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- SECTION 1 - SHARED UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 2 - USERS TABLE
-- Purpose: Custom authentication/authorization table used by /api/auth and /api/admin
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'subadmin', 'user', 'client', 'employer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_no_public_access ON users;
CREATE POLICY users_no_public_access ON users
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 3 - AUTHENTICATION FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'user',
  p_permissions JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  permissions JSONB,
  is_active BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (email, full_name, password_hash, role, permissions, is_active)
  VALUES (
    lower(trim(p_email)),
    trim(p_full_name),
    crypt(p_password, gen_salt('bf')),
    p_role,
    COALESCE(p_permissions, '[]'::jsonb),
    true
  )
  RETURNING users.id INTO v_user_id;

  RETURN QUERY
  SELECT users.id, users.email, users.full_name, users.role, users.permissions, users.is_active
  FROM users
  WHERE users.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = p_user_id
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION login_user(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  permissions JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.company,
    u.role,
    u.permissions,
    u.is_active
  FROM users u
  WHERE u.email = lower(trim(p_email))
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.is_active = true
    AND u.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SECTION 4 - PAGE CONTENT TABLE
-- Purpose: CMS content blocks for Home/Services/Recruitment sections
-- ============================================================
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_page_content_key ON page_content(page_key) WHERE is_active = true AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_page_content_updated_at ON page_content;
CREATE TRIGGER trg_page_content_updated_at
BEFORE UPDATE ON page_content
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS page_content_public_read ON page_content;
CREATE POLICY page_content_public_read ON page_content
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

INSERT INTO page_content (page_key, content)
VALUES
  ('home_quality_consulting', '{"title_ar":"أنظمة الجودة والاستشارات","text_ar":"تجمع SCQ GROUP بين إرثٍ استشاري يمتد لأكثر من 25 عاماً من الخبرة التراكمية لمؤسسها وفريق من الخبراء المتخصصين في هندسة الأعمال وإدارة الموارد البشرية. نحن لا نقدم حلولاً تقليدية، بل نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك عبر ممارسات إدارية وقانونية منضبطة."}'::jsonb),
  ('home_integrated_hr_solutions', '{"title_ar":"الحلول المتكاملة للموارد البشرية","subtitle_ar":"نقدم حلولاً شاملة تغطي جميع جوانب إدارة الموارد البشرية"}'::jsonb),
  ('services_intro', '{"title_ar":"خدماتنا الاستشارية","text_ar":"نقدم مجموعة متكاملة من الخدمات الاستشارية في مجال الموارد البشرية وهندسة الأعمال"}'::jsonb),
  ('recruitment_intro', '{"title_ar":"باقات التوظيف","text_ar":"اختر الباقة المناسبة لاحتياجاتك من بين باقاتنا المتنوعة"}'::jsonb)
ON CONFLICT (page_key) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================================
-- SECTION 5 - BLOG POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'فريق SCQ',
  category TEXT DEFAULT 'استراتيجية',
  image_url TEXT,
  booking_link TEXT DEFAULT '/consultation',
  button_text TEXT DEFAULT 'احجز استشارة',
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category) WHERE deleted_at IS NULL AND is_published = true;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS blog_posts_public_read ON blog_posts;
CREATE POLICY blog_posts_public_read ON blog_posts
  FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    NEW.slug := trim(both '-' from NEW.slug);

    IF EXISTS (SELECT 1 FROM blog_posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 8);
    END IF;
  END IF;

  IF NEW.is_published = true AND NEW.published_at IS NULL THEN
    NEW.published_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_slug ON blog_posts;
CREATE TRIGGER set_blog_slug
BEFORE INSERT OR UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION generate_blog_slug();

-- ============================================================
-- SECTION 6 - CONTACT REQUESTS TABLE
-- Purpose: Public contact form + admin contact requests
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'resolved', 'closed')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_requests_created ON contact_requests(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_requests_assigned ON contact_requests(assigned_to) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER trg_contact_requests_updated_at
BEFORE UPDATE ON contact_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contact_requests_no_public_access ON contact_requests;
CREATE POLICY contact_requests_no_public_access ON contact_requests
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 7 - CONSULTATION BOOKINGS TABLE
-- Purpose: BookingModal + /api/bookings + admin stats
-- Supports both new and legacy column names used by current code.
-- ============================================================
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  customer_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  notes TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT consultation_bookings_name_required CHECK (name IS NOT NULL OR customer_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON consultation_bookings(preferred_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_created ON consultation_bookings(created_at DESC) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER trg_consultation_bookings_updated_at
BEFORE UPDATE ON consultation_bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS consultation_bookings_no_public_access ON consultation_bookings;
CREATE POLICY consultation_bookings_no_public_access ON consultation_bookings
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 8 - SERVICE PAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS service_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  subtitle_ar TEXT,
  subtitle_en TEXT,
  short_description_ar TEXT,
  short_description_en TEXT,
  details_ar TEXT,
  details_en TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  stages JSONB DEFAULT '[]'::jsonb,
  why_scq_ar TEXT,
  why_scq_en TEXT,
  icon TEXT,
  hero_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_service_pages_active ON service_pages(is_active, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_pages_slug ON service_pages(slug) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_service_pages_updated_at ON service_pages;
CREATE TRIGGER trg_service_pages_updated_at
BEFORE UPDATE ON service_pages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE service_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_pages_public_read ON service_pages;
CREATE POLICY service_pages_public_read ON service_pages
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

INSERT INTO service_pages (slug, title_ar, title_en, short_description_ar, details_ar, deliverables, stages, why_scq_ar, icon, sort_order)
VALUES
  ('policies-structure','إعداد السياسات وهيكلة الشركات','Policies & Corporate Structure','نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك','نقدم خدمات متكاملة لإعداد السياسات الإدارية وهيكلة الشركات بما يتوافق مع أفضل الممارسات العالمية والمتطلبات المحلية.','["دليل السياسات والإجراءات الإدارية","الهيكل التنظيمي المعتمد","مصفوفة الصلاحيات والمسؤوليات","نماذج العمل الإدارية"]'::jsonb,'["تحليل الوضع الحالي","تصميم الهيكل التنظيمي","إعداد السياسات","التطبيق والمتابعة"]'::jsonb,'خبرة تراكمية تمتد لأكثر من 25 عاماً في هندسة الأعمال وإدارة الموارد البشرية','building',1),
  ('hr-strategic-planning','التخطيط الاستراتيجي للموارد البشرية','HR Strategic Planning','نحول التحديات الإدارية إلى فرص تنافسية من خلال التخطيط الاستراتيجي','نساعدك في بناء استراتيجية موارد بشرية متكاملة تتماشى مع أهداف شركتك وتضمن استقطاب وتطوير الكفاءات.','["خطة الموارد البشرية الاستراتيجية","خطة التوظيف السنوية","خطة التدريب والتطوير","مؤشرات الأداء الرئيسية"]'::jsonb,'["تحليل الوضع الراهن","تحديد الأهداف الاستراتيجية","بناء الخطة التنفيذية","المتابعة والتقييم"]'::jsonb,'نمتلك فريقاً من الخبراء المتخصصين في هندسة الأعمال وإدارة الموارد البشرية','target',2),
  ('payroll-benefits','إعداد أنظمة الرواتب والمزايا وفق المعايير الحديثة','Payroll & Benefits Systems','أنظمة رواتب ومزايا عادلة وتنافسية تضمن رضا الموظفين','نصمم أنظمة رواتب ومزايا متوافقة مع قانون العمل والمعايير الدولية، تضمن العدالة الداخلية والتنافسية الخارجية.','["هيكل الرواتب والدرجات","نظام المزايا والحوافز","سياسات التعويضات","دليل الرواتب والمزايا"]'::jsonb,'["دراسة السوق","تصميم الهيكل","إعداد السياسات","التطبيق والمراجعة"]'::jsonb,'نضمن التوافق مع قانون العمل والمعايير الدولية','dollar-sign',3),
  ('job-description','تصميم وتحديث بطاقات ودليل الوصف الوظيفي','Job Description Design','أوصاف وظيفية دقيقة تحدد المسؤوليات والمتطلبات بوضوح','نعد بطاقات وصف وظيفي شاملة ودقيقة تحدد المسؤوليات والصلاحيات والمتطلبات لكل وظيفة.','["دليل الوصف الوظيفي الشامل","بطاقات الوصف الوظيفي","مصفوفة المهام والمسؤوليات","معايير الأداء الوظيفي"]'::jsonb,'["تحليل الوظائف","تصميم البطاقات","المراجعة والاعتماد","التحديث الدوري"]'::jsonb,'نستخدم أفضل الممارسات العالمية في تحليل وتصميم الوظائف','file-text',4),
  ('kpi-system','تصميم وتطبيق نظام مؤشرات الأداء','KPI System Design','نظام مؤشرات أداء فعال يقيس الإنجاز ويحفز التميز','نصمم نظام مؤشرات أداء متكامل يربط أهداف الأفراد بأهداف المنظمة ويضمن قياس الأداء بموضوعية.','["دليل مؤشرات الأداء","نماذج التقييم","نظام المتابعة والقياس","تقارير الأداء الدورية"]'::jsonb,'["تحديد الأهداف الاستراتيجية","تصميم المؤشرات","بناء نظام القياس","التطبيق والمتابعة"]'::jsonb,'نربط مؤشرات الأداء بالأهداف الاستراتيجية للمنظمة','bar-chart',5),
  ('recruitment','التوظيف واستقطاب الخبرات','Recruitment & Talent Acquisition','نستقطب الجدارة ونوفر لك الكفاءات المناسبة','نقدم خدمات توظيف متكاملة من البحث والاستقطاب حتى التعيين، مع باقات توظيف متنوعة تناسب احتياجاتك.','["سير ذاتية مفلترة","تقييم فني وسلوكي","تقارير مفصلة","ضمان الجودة"]'::jsonb,'["تحليل الاحتياج","البحث والاستقطاب","الفرز والتقييم","الترشيح والتعيين"]'::jsonb,'نمتلك قاعدة بيانات ضخمة من الكفاءات المؤهلة في مختلف التخصصات','users',6),
  ('business-setup','تأسيس الشركات وهندسة الأعمال','Business Setup & Engineering','نساعدك في تأسيس شركتك بشكل احترافي ومتوافق مع الأنظمة','نقدم خدمات متكاملة لتأسيس الشركات وهندسة الأعمال من الفكرة حتى التشغيل الفعلي.','["دراسة الجدوى","الهيكل القانوني والإداري","التراخيص والتصاريح","الأنظمة الإدارية"]'::jsonb,'["دراسة الفكرة","التأسيس القانوني","البناء الإداري","التشغيل والمتابعة"]'::jsonb,'خبرة واسعة في تأسيس وهيكلة الشركات في مختلف القطاعات','briefcase',7),
  ('outsourcing','إدارة خدمات التعهيد Outsourcing Solutions','Outsourcing Solutions','حلول تعهيد مرنة تخفض التكاليف وترفع الكفاءة','نوفر حلول تعهيد متكاملة للموارد البشرية والخدمات الإدارية بجودة عالية وتكلفة مناسبة.','["إدارة الموارد البشرية","خدمات الرواتب","خدمات التوظيف","الخدمات الإدارية"]'::jsonb,'["تحليل الاحتياج","تصميم الحل","التنفيذ","الإدارة والمتابعة"]'::jsonb,'نوفر لك فريقاً متخصصاً يدير عملياتك بكفاءة عالية','settings',8)
ON CONFLICT (slug) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  title_en = EXCLUDED.title_en,
  short_description_ar = EXCLUDED.short_description_ar,
  details_ar = EXCLUDED.details_ar,
  deliverables = EXCLUDED.deliverables,
  stages = EXCLUDED.stages,
  why_scq_ar = EXCLUDED.why_scq_ar,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================
-- SECTION 9 - RECRUITMENT PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recruitment_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  cv_count INTEGER NOT NULL,
  is_scq_verified BOOLEAN DEFAULT false,
  status_ar TEXT,
  status_en TEXT,
  scope_ar TEXT,
  scope_en TEXT,
  duration_days INTEGER DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  advisory_value_ar TEXT,
  advisory_value_en TEXT,
  compatibility_ar TEXT,
  compatibility_en TEXT,
  badge_ar TEXT,
  badge_en TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recruitment_packages_active ON recruitment_packages(is_active, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recruitment_packages_slug ON recruitment_packages(slug) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_recruitment_packages_updated_at ON recruitment_packages;
CREATE TRIGGER trg_recruitment_packages_updated_at
BEFORE UPDATE ON recruitment_packages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE recruitment_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recruitment_packages_public_read ON recruitment_packages;
CREATE POLICY recruitment_packages_public_read ON recruitment_packages
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

INSERT INTO recruitment_packages (slug, name_ar, name_en, tier, cv_count, is_scq_verified, status_ar, status_en, scope_ar, scope_en, duration_days, features, advisory_value_ar, compatibility_ar, badge_ar, sort_order)
VALUES
  ('bronze-package','باقة البرونز','Bronze Package','bronze',20,false,'غير مفحوصة من قبل خبراء SCQ','Not verified by SCQ experts','لوظيفة واحدة فقط','For one job only',30,'["20 سيرة ذاتية","بحث متقدم وفلترة ذكية","تسليم خلال 30 يوم"]'::jsonb,'مناسبة للشركات الناشئة','مناسبة للشركات الناشئة والصغيرة','برونز',1),
  ('silver-package','باقة الفضة','Silver Package','silver',50,false,'غير مفحوصة من قبل خبراء SCQ','Not verified by SCQ experts','لوظيفة واحدة فقط','For one job only',30,'["50 سيرة ذاتية","بحث متقدم وفلترة ذكية","تسليم خلال 30 يوم","تنوع أكبر في الخيارات"]'::jsonb,'مناسبة للشركات المتوسطة والكبيرة','مناسبة للشركات المتوسطة والكبيرة','فضة',2),
  ('gold-package','باقة الذهب','Gold Package','gold',20,true,'SCQ Verified - محققة فنياً وسلوكياً','SCQ Verified - technically and behaviorally verified','لوظيفة واحدة','For one job',30,'["20 سيرة ذاتية مفحوصة ومعتمدة","فلترة فنية وسلوكية","توفير 80% من الجهد الإداري","تقارير تفصيلية"]'::jsonb,'توفير 80% من الجهد الإداري في فرز ومقابلة غير المطابقين','مناسبة للشركات المتوسطة والكبيرة','SCQ Verified',3),
  ('platinum-package','باقة البلاتين','Platinum Package','platinum',50,true,'SCQ Verified - تقييم استشاري كامل','SCQ Verified - full consulting evaluation','لوظيفة واحدة','For one job',30,'["50 سيرة ذاتية مفحوصة ومعتمدة","تقييم استشاري شامل","تقارير موجزة","أولوية الوصول للكفاءات النادرة","ضمان التوافق الثقافي والفني"]'::jsonb,'تقييم استشاري شامل يشمل التوافق الثقافي والفني','مناسبة للشركات الكبيرة','SCQ Verified Premium',4)
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  tier = EXCLUDED.tier,
  cv_count = EXCLUDED.cv_count,
  is_scq_verified = EXCLUDED.is_scq_verified,
  status_ar = EXCLUDED.status_ar,
  scope_ar = EXCLUDED.scope_ar,
  features = EXCLUDED.features,
  advisory_value_ar = EXCLUDED.advisory_value_ar,
  compatibility_ar = EXCLUDED.compatibility_ar,
  badge_ar = EXCLUDED.badge_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================
-- SECTION 10 - QUOTE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  representative_name TEXT NOT NULL,
  representative_role TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  company_activity TEXT NOT NULL,
  vacancy_nature TEXT NOT NULL,
  challenges JSONB DEFAULT '[]'::jsonb,
  employees_needed INTEGER NOT NULL CHECK (employees_needed > 0),
  required_professions JSONB DEFAULT '[]'::jsonb,
  selected_package_slug TEXT REFERENCES recruitment_packages(slug),
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'quoted', 'contacted', 'closed', 'rejected')),
  assigned_to UUID REFERENCES users(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quote_requests_assigned ON quote_requests(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quote_requests_package ON quote_requests(selected_package_slug) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_quote_requests_updated_at ON quote_requests;
CREATE TRIGGER trg_quote_requests_updated_at
BEFORE UPDATE ON quote_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS quote_requests_no_public_access ON quote_requests;
CREATE POLICY quote_requests_no_public_access ON quote_requests
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 11 - CANDIDATE PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  national_id TEXT,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  nationality TEXT,
  gender TEXT,
  age INTEGER CHECK (age IS NULL OR (age >= 14 AND age <= 100)),
  marital_status TEXT,
  has_driving_license BOOLEAN,
  owns_car BOOLEAN,
  country TEXT,
  city TEXT,
  district TEXT,
  military_status TEXT,
  has_previous_court_judgments BOOLEAN,
  has_criminal_record_document BOOLEAN,
  registered_in_social_insurance BOOLEAN,
  has_labor_cases BOOLEAN,
  education_level TEXT,
  education_specialization TEXT,
  functional_sector TEXT,
  current_job_title TEXT,
  total_experience_years INTEGER CHECK (total_experience_years IS NULL OR total_experience_years >= 0),
  current_salary NUMERIC,
  expected_salary NUMERIC,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'scq_verified', 'rejected')),
  premium_badge BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'verified', 'hidden', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_code ON candidate_profiles(candidate_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_status ON candidate_profiles(verification_status, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_sector ON candidate_profiles(functional_sector) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_city ON candidate_profiles(city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_created ON candidate_profiles(created_at DESC) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_candidate_profiles_updated_at ON candidate_profiles;
CREATE TRIGGER trg_candidate_profiles_updated_at
BEFORE UPDATE ON candidate_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidate_profiles_no_public_access ON candidate_profiles;
CREATE POLICY candidate_profiles_no_public_access ON candidate_profiles
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION generate_candidate_code()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(candidate_code FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM candidate_profiles
  WHERE candidate_code LIKE 'SCQ-CAN-%';

  NEW.candidate_code := 'SCQ-CAN-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_candidate_code ON candidate_profiles;
CREATE TRIGGER set_candidate_code
BEFORE INSERT ON candidate_profiles
FOR EACH ROW
WHEN (NEW.candidate_code IS NULL)
EXECUTE FUNCTION generate_candidate_code();

-- ============================================================
-- SECTION 12 - CANDIDATE EXPERIENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  job_title TEXT,
  job_tasks TEXT,
  from_date DATE,
  to_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_experiences_candidate ON candidate_experiences(candidate_id, sort_order);
ALTER TABLE candidate_experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidate_experiences_no_public_access ON candidate_experiences;
CREATE POLICY candidate_experiences_no_public_access ON candidate_experiences
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 13 - CANDIDATE LANGUAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_languages_candidate ON candidate_languages(candidate_id, sort_order);
ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidate_languages_no_public_access ON candidate_languages;
CREATE POLICY candidate_languages_no_public_access ON candidate_languages
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 14 - CANDIDATE COMPUTER SKILLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_computer_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_computer_skills_candidate ON candidate_computer_skills(candidate_id, sort_order);
ALTER TABLE candidate_computer_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidate_computer_skills_no_public_access ON candidate_computer_skills;
CREATE POLICY candidate_computer_skills_no_public_access ON candidate_computer_skills
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 15 - ADMIN AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON admin_audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_audit_logs_no_public_access ON admin_audit_logs;
CREATE POLICY admin_audit_logs_no_public_access ON admin_audit_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 16 - RAG DOCUMENTS TABLE
-- Purpose: AI chat knowledge base. Uses Hugging Face all-MiniLM-L6-v2 embeddings = 384 dimensions.
-- ============================================================
CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(384),
  metadata JSONB DEFAULT '{}'::jsonb,
  source_type VARCHAR(50),
  source_id VARCHAR(255),
  tenant_id UUID,
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rag_documents_tenant ON rag_documents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents(source_type, source_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rag_documents_language ON rag_documents(language) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rag_documents_created ON rag_documents(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding ON rag_documents USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;

DROP TRIGGER IF EXISTS trg_rag_documents_updated_at ON rag_documents;
CREATE TRIGGER trg_rag_documents_updated_at
BEFORE UPDATE ON rag_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rag_documents_public_read ON rag_documents;
CREATE POLICY rag_documents_public_read ON rag_documents
  FOR SELECT
  USING (deleted_at IS NULL);

-- ============================================================
-- SECTION 17 - CHAT CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at DESC) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER trg_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chat_conversations_no_public_access ON chat_conversations;
CREATE POLICY chat_conversations_no_public_access ON chat_conversations
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 18 - CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_used JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chat_messages_no_public_access ON chat_messages;
CREATE POLICY chat_messages_no_public_access ON chat_messages
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 19 - RAG INGESTION JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rag_ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_chunks INTEGER DEFAULT 0,
  processed_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rag_ingestion_status ON rag_ingestion_jobs(status, created_at DESC);

ALTER TABLE rag_ingestion_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rag_ingestion_jobs_no_public_access ON rag_ingestion_jobs;
CREATE POLICY rag_ingestion_jobs_no_public_access ON rag_ingestion_jobs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECTION 20 - RAG HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION search_similar_documents(
  query_embedding vector(384),
  match_threshold FLOAT DEFAULT 0.6,
  match_count INT DEFAULT 5,
  filter_language VARCHAR DEFAULT NULL,
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  source_type VARCHAR,
  source_id VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.metadata,
    d.source_type,
    d.source_id
  FROM rag_documents d
  WHERE d.deleted_at IS NULL
    AND d.embedding IS NOT NULL
    AND (filter_language IS NULL OR d.language = filter_language)
    AND (filter_tenant_id IS NULL OR d.tenant_id = filter_tenant_id)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_conversations(days_old INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  affected_count INT;
BEGIN
  UPDATE chat_conversations
  SET deleted_at = NOW()
  WHERE created_at < NOW() - (days_old || ' days')::interval
    AND deleted_at IS NULL;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_conversation_context(
  conv_id UUID,
  message_limit INT DEFAULT 10
)
RETURNS TABLE (
  role VARCHAR,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT cm.role, cm.content, cm.created_at
  FROM chat_messages cm
  WHERE cm.conversation_id = conv_id
    AND cm.deleted_at IS NULL
  ORDER BY cm.created_at DESC
  LIMIT message_limit;
END;
$$;

-- ============================================================
-- SECTION 21 - OPTIONAL SUPABASE STORAGE BUCKETS
-- Purpose: Buckets used by /api/upload.js
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('cvs', 'cvs', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies. Service-role API uploads can bypass these, but public reads for public buckets are useful.
DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS blog_images_public_read ON storage.objects;
CREATE POLICY blog_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- ============================================================
-- SECTION 22 - FINAL VERIFICATION NOTICES
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'SCQ GROUP complete schema finished successfully.';
  RAISE NOTICE 'Public tables created: users, page_content, blog_posts, contact_requests, consultation_bookings, service_pages, recruitment_packages, quote_requests, candidate_profiles, candidate_experiences, candidate_languages, candidate_computer_skills, admin_audit_logs, rag_documents, chat_conversations, chat_messages, rag_ingestion_jobs.';
  RAISE NOTICE 'Functions created: create_user_with_password, update_user_password, login_user, generate_blog_slug, generate_candidate_code, search_similar_documents, cleanup_old_conversations, get_conversation_context.';
END $$;

COMMIT;
