-- ============================================================
-- SCQ GROUP Recruitment & Content System Migration
-- Date: 2026-05-01
-- Description: Complete production-ready database schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. SERVICE PAGES TABLE
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

-- Create index for active services
CREATE INDEX IF NOT EXISTS idx_service_pages_active ON service_pages(is_active, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_pages_slug ON service_pages(slug) WHERE deleted_at IS NULL;

-- Seed service pages
INSERT INTO service_pages (slug, title_ar, title_en, short_description_ar, details_ar, deliverables, stages, why_scq_ar, icon, sort_order)
VALUES 
(
  'policies-structure',
  'إعداد السياسات وهيكلة الشركات',
  'Policies & Corporate Structure',
  'نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك',
  'نقدم خدمات متكاملة لإعداد السياسات الإدارية وهيكلة الشركات بما يتوافق مع أفضل الممارسات العالمية والمتطلبات المحلية.',
  '["دليل السياسات والإجراءات الإدارية", "الهيكل التنظيمي المعتمد", "مصفوفة الصلاحيات والمسؤوليات", "نماذج العمل الإدارية"]'::jsonb,
  '["تحليل الوضع الحالي", "تصميم الهيكل التنظيمي", "إعداد السياسات", "التطبيق والمتابعة"]'::jsonb,
  'خبرة تراكمية تمتد لأكثر من 25 عاماً في هندسة الأعمال وإدارة الموارد البشرية',
  'building',
  1
),
(
  'hr-strategic-planning',
  'التخطيط الاستراتيجي للموارد البشرية',
  'HR Strategic Planning',
  'نحول التحديات الإدارية إلى فرص تنافسية من خلال التخطيط الاستراتيجي',
  'نساعدك في بناء استراتيجية موارد بشرية متكاملة تتماشى مع أهداف شركتك وتضمن استقطاب وتطوير الكفاءات.',
  '["خطة الموارد البشرية الاستراتيجية", "خطة التوظيف السنوية", "خطة التدريب والتطوير", "مؤشرات الأداء الرئيسية"]'::jsonb,
  '["تحليل الوضع الراهن", "تحديد الأهداف الاستراتيجية", "بناء الخطة التنفيذية", "المتابعة والتقييم"]'::jsonb,
  'نمتلك فريقاً من الخبراء المتخصصين في هندسة الأعمال وإدارة الموارد البشرية',
  'target',
  2
),
(
  'payroll-benefits',
  'إعداد أنظمة الرواتب والمزايا وفق المعايير الحديثة',
  'Payroll & Benefits Systems',
  'أنظمة رواتب ومزايا عادلة وتنافسية تضمن رضا الموظفين',
  'نصمم أنظمة رواتب ومزايا متوافقة مع قانون العمل والمعايير الدولية، تضمن العدالة الداخلية والتنافسية الخارجية.',
  '["هيكل الرواتب والدرجات", "نظام المزايا والحوافز", "سياسات التعويضات", "دليل الرواتب والمزايا"]'::jsonb,
  '["دراسة السوق", "تصميم الهيكل", "إعداد السياسات", "التطبيق والمراجعة"]'::jsonb,
  'نضمن التوافق مع قانون العمل والمعايير الدولية',
  'dollar-sign',
  3
),
(
  'job-description',
  'تصميم وتحديث بطاقات ودليل الوصف الوظيفي',
  'Job Description Design',
  'أوصاف وظيفية دقيقة تحدد المسؤوليات والمتطلبات بوضوح',
  'نعد بطاقات وصف وظيفي شاملة ودقيقة تحدد المسؤوليات والصلاحيات والمتطلبات لكل وظيفة.',
  '["دليل الوصف الوظيفي الشامل", "بطاقات الوصف الوظيفي", "مصفوفة المهام والمسؤوليات", "معايير الأداء الوظيفي"]'::jsonb,
  '["تحليل الوظائف", "تصميم البطاقات", "المراجعة والاعتماد", "التحديث الدوري"]'::jsonb,
  'نستخدم أفضل الممارسات العالمية في تحليل وتصميم الوظائف',
  'file-text',
  4
),
(
  'kpi-system',
  'تصميم وتطبيق نظام مؤشرات الأداء',
  'KPI System Design',
  'نظام مؤشرات أداء فعال يقيس الإنجاز ويحفز التميز',
  'نصمم نظام مؤشرات أداء متكامل يربط أهداف الأفراد بأهداف المنظمة ويضمن قياس الأداء بموضوعية.',
  '["دليل مؤشرات الأداء", "نماذج التقييم", "نظام المتابعة والقياس", "تقارير الأداء الدورية"]'::jsonb,
  '["تحديد الأهداف الاستراتيجية", "تصميم المؤشرات", "بناء نظام القياس", "التطبيق والمتابعة"]'::jsonb,
  'نربط مؤشرات الأداء بالأهداف الاستراتيجية للمنظمة',
  'bar-chart',
  5
),
(
  'recruitment',
  'التوظيف واستقطاب الخبرات',
  'Recruitment & Talent Acquisition',
  'نستقطب الجدارة ونوفر لك الكفاءات المناسبة',
  'نقدم خدمات توظيف متكاملة من البحث والاستقطاب حتى التعيين، مع باقات توظيف متنوعة تناسب احتياجاتك.',
  '["سير ذاتية مفلترة", "تقييم فني وسلوكي", "تقارير مفصلة", "ضمان الجودة"]'::jsonb,
  '["تحليل الاحتياج", "البحث والاستقطاب", "الفرز والتقييم", "الترشيح والتعيين"]'::jsonb,
  'نمتلك قاعدة بيانات ضخمة من الكفاءات المؤهلة في مختلف التخصصات',
  'users',
  6
),
(
  'business-setup',
  'تأسيس الشركات وهندسة الأعمال',
  'Business Setup & Engineering',
  'نساعدك في تأسيس شركتك بشكل احترافي ومتوافق مع الأنظمة',
  'نقدم خدمات متكاملة لتأسيس الشركات وهندسة الأعمال من الفكرة حتى التشغيل الفعلي.',
  '["دراسة الجدوى", "الهيكل القانوني والإداري", "التراخيص والتصاريح", "الأنظمة الإدارية"]'::jsonb,
  '["دراسة الفكرة", "التأسيس القانوني", "البناء الإداري", "التشغيل والمتابعة"]'::jsonb,
  'خبرة واسعة في تأسيس وهيكلة الشركات في مختلف القطاعات',
  'briefcase',
  7
),
(
  'outsourcing',
  'إدارة خدمات التعهيد Outsourcing Solutions',
  'Outsourcing Solutions',
  'حلول تعهيد مرنة تخفض التكاليف وترفع الكفاءة',
  'نوفر حلول تعهيد متكاملة للموارد البشرية والخدمات الإدارية بجودة عالية وتكلفة مناسبة.',
  '["إدارة الموارد البشرية", "خدمات الرواتب", "خدمات التوظيف", "الخدمات الإدارية"]'::jsonb,
  '["تحليل الاحتياج", "تصميم الحل", "التنفيذ", "الإدارة والمتابعة"]'::jsonb,
  'نوفر لك فريقاً متخصصاً يدير عملياتك بكفاءة عالية',
  'settings',
  8
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. RECRUITMENT PACKAGES TABLE
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

-- Seed recruitment packages
INSERT INTO recruitment_packages (slug, name_ar, name_en, tier, cv_count, is_scq_verified, status_ar, status_en, scope_ar, scope_en, duration_days, features, advisory_value_ar, compatibility_ar, badge_ar, sort_order)
VALUES
(
  'bronze-package',
  'باقة البرونز',
  'Bronze Package',
  'bronze',
  20,
  false,
  'غير محققة من قبل خبراء SCQ',
  'Not verified by SCQ experts',
  'لوظيفة واحدة فقط',
  'For one job only',
  30,
  '["20 سيرة ذاتية", "بحث متقدم وفلترة ذكية", "تسليم خلال 30 يوم"]'::jsonb,
  'مناسبة للشركات الناشئة',
  'مناسبة للشركات الناشئة والصغيرة',
  'برونز',
  1
),
(
  'silver-package',
  'باقة الفضة',
  'Silver Package',
  'silver',
  50,
  false,
  'غير محققة من قبل خبراء SCQ',
  'Not verified by SCQ experts',
  'لوظيفة واحدة فقط',
  'For one job only',
  30,
  '["50 سيرة ذاتية", "بحث متقدم وفلترة ذكية", "تسليم خلال 30 يوم", "تنوع أكبر في الخيارات"]'::jsonb,
  'مناسبة للشركات المتوسطة والكبرى',
  'مناسبة للشركات المتوسطة والكبرى',
  'فضة',
  2
),
(
  'gold-package',
  'باقة الذهب',
  'Gold Package',
  'gold',
  20,
  true,
  'SCQ Verified - محققة فنياً وسلوكياً',
  'SCQ Verified - Technically and behaviorally verified',
  'لوظيفة واحدة',
  'For one job',
  30,
  '["20 سيرة ذاتية محققة", "فلترة فنية وسلوكية", "توفير 80% من الجهد الإداري", "تقارير تفصيلية"]'::jsonb,
  'توفير 80% من الجهد الإداري',
  'مناسبة للشركات المتوسطة والكبرى',
  'SCQ Verified',
  3
),
(
  'platinum-package',
  'باقة البلاتين',
  'Platinum Package',
  'platinum',
  50,
  true,
  'SCQ Verified - تقييم استشاري كامل',
  'SCQ Verified - Full consulting evaluation',
  'لوظيفة واحدة',
  'For one job',
  30,
  '["50 سيرة ذاتية محققة", "تقييم استشاري شامل", "تقارير مفصلة", "أولوية الوصول للمواهب النادرة", "ضمان التوافق الثقافي والفني"]'::jsonb,
  'تقييم استشاري شامل يشمل التوافق الثقافي والفني',
  'مناسبة للشركات الكبرى والمناصب القيادية',
  'SCQ Verified Premium',
  4
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. QUOTE REQUESTS TABLE
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
  employees_needed INTEGER NOT NULL,
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

-- ============================================================
-- 4. CANDIDATE PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_code TEXT UNIQUE,
  -- Contact Info (SENSITIVE - Admin only)
  full_name TEXT NOT NULL,
  national_id TEXT,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  -- Basic Info
  nationality TEXT,
  gender TEXT,
  age INTEGER,
  marital_status TEXT,
  has_driving_license BOOLEAN,
  owns_car BOOLEAN,
  country TEXT,
  city TEXT,
  district TEXT,
  -- Legal Status
  military_status TEXT,
  has_previous_court_judgments BOOLEAN,
  has_criminal_record_document BOOLEAN,
  registered_in_social_insurance BOOLEAN,
  has_labor_cases BOOLEAN,
  -- Education
  education_level TEXT,
  education_specialization TEXT,
  -- Professional
  functional_sector TEXT,
  current_job_title TEXT,
  total_experience_years INTEGER,
  current_salary NUMERIC,
  expected_salary NUMERIC,
  -- Status
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

-- Auto-generate candidate code
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

CREATE TRIGGER set_candidate_code
BEFORE INSERT ON candidate_profiles
FOR EACH ROW
WHEN (NEW.candidate_code IS NULL)
EXECUTE FUNCTION generate_candidate_code();

-- ============================================================
-- 5. CANDIDATE EXPERIENCES TABLE
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

-- ============================================================
-- 6. CANDIDATE LANGUAGES TABLE
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

-- ============================================================
-- 7. CANDIDATE COMPUTER SKILLS TABLE
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

-- ============================================================
-- 8. ADMIN AUDIT LOGS TABLE
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

-- ============================================================
-- 9. UPDATE USERS TABLE - Add permissions column if not exists
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'permissions') THEN
    ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================================
-- 10. CONTENT BLOCKS - Use existing page_content table
-- ============================================================

-- Insert default content if not exists
INSERT INTO page_content (page_key, content)
VALUES
(
  'home_quality_consulting',
  '{"title_ar": "أنظمة الجودة والاستشارات", "text_ar": "تجمع SCQ GROUP بين إرثٍ استشاري يمتد لأكثر من 25 عاماً من الخبرة التراكمية لمؤسسها وفريق من الخبراء المتخصصين في هندسة الأعمال وإدارة الموارد البشرية. نحن لا نقدم حلولاً تقليدية، بل نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك عبر ممارسات إدارية وقانونية منضبطة."}'::jsonb
),
(
  'home_integrated_hr_solutions',
  '{"title_ar": "الحلول المتكاملة للموارد البشرية", "subtitle_ar": "نقدم حلولاً شاملة تغطي جميع جوانب إدارة الموارد البشرية"}'::jsonb
),
(
  'services_intro',
  '{"title_ar": "خدماتنا الاستشارية", "text_ar": "نقدم مجموعة متكاملة من الخدمات الاستشارية في مجال الموارد البشرية وهندسة الأعمال"}'::jsonb
),
(
  'recruitment_intro',
  '{"title_ar": "باقات التوظيف", "text_ar": "اختر الباقة المناسبة لاحتياجاتك من بين باقاتنا المتنوعة"}'::jsonb
)
ON CONFLICT (page_key) DO NOTHING;

-- ============================================================
-- 11. RLS POLICIES (Optional - APIs use service role)
-- ============================================================

-- Enable RLS on sensitive tables
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using serverless APIs with service role,
-- RLS policies are optional. APIs handle authorization.

-- ============================================================
-- 12. HELPER FUNCTIONS FOR USER MANAGEMENT
-- ============================================================

-- Function to create user with hashed password
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'client',
  p_permissions JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (email, full_name, password_hash, role, permissions, is_active)
  VALUES (
    p_email,
    p_full_name,
    crypt(p_password, gen_salt('bf')),
    p_role,
    p_permissions,
    true
  )
  RETURNING users.id INTO v_user_id;

  RETURN QUERY
  SELECT users.id, users.email, users.full_name, users.role
  FROM users
  WHERE users.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user password
CREATE OR REPLACE FUNCTION update_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'SCQ Recruitment & Content System Migration completed successfully';
END $$;
