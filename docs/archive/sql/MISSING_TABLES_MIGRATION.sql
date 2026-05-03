-- ============================================================================
-- Complete Database Setup for SCK Platform  
-- Run this in Supabase SQL Editor to create all required tables
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Disable RLS temporarily for setup (safe approach)
DO $do1$
BEGIN
    -- Disable RLS on existing tables
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'contact_requests') THEN
        ALTER TABLE contact_requests DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consultation_bookings') THEN
        ALTER TABLE consultation_bookings DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'blog_posts') THEN
        ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
    END IF;
END $do1$;

-- ============================================================================
-- Create/Update Users Table with all required columns
-- ============================================================================

-- Create or update users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin', 'consultant', 'subadmin', 'user', 'employer')),
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT NULL,
    approval_status VARCHAR(20) DEFAULT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to users table if they don't exist
DO $do2$
BEGIN
    -- Add password_hash if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Add role if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'client';
    END IF;
    
    -- Add is_active if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add is_approved if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_approved') THEN
        ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT NULL;
    END IF;
    
    -- Add approval_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='approval_status') THEN
        ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT NULL;
    END IF;
    
    -- Add last_login_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add deleted_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $do2$;

-- Ensure Super Admin exists with correct password
DO $do3$
BEGIN
    -- Check if Super Admin exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sck.com') THEN
        -- Insert Super Admin with hashed password
        INSERT INTO users (
            email, 
            password_hash, 
            full_name, 
            role, 
            is_active,
            metadata
        ) VALUES (
            'admin@sck.com',
            crypt('scq2025', gen_salt('bf', 10)),
            'Super Admin',
            'admin',
            true,
            '{"is_default_admin": true}'::jsonb
        );
        
        RAISE NOTICE '✅ Super Admin created successfully';
    ELSE
        -- Update existing admin password to ensure it works
        UPDATE users 
        SET password_hash = crypt('scq2025', gen_salt('bf', 10)),
            is_active = true,
            role = 'admin'
        WHERE email = 'admin@sck.com';
        
        RAISE NOTICE '✅ Super Admin password updated';
    END IF;
END $do3$;

-- Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'pending', 'resolved', 'rejected')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation Bookings Table
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    service_type VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_range VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    context JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Sub-Admins and Permissions Tables
-- ============================================================================

-- Admin Permissions Table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Employer Approvals Table
CREATE TABLE IF NOT EXISTS employer_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    experience_years INTEGER,
    education VARCHAR(200),
    cv_url TEXT,
    cover_letter TEXT,
    linkedin_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Create Database Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$fn$;

-- Password verification function
CREATE OR REPLACE FUNCTION verify_user_password(user_email TEXT, user_password TEXT) 
RETURNS TABLE(
    id UUID,
    email VARCHAR(255),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20),
    is_active BOOLEAN,
    is_approved BOOLEAN,
    approval_status VARCHAR(20),
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $verify_fn$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.full_name, u.phone, u.company, u.role, 
           u.is_active, u.is_approved, u.approval_status, u.last_login_at, 
           u.metadata, u.created_at, u.updated_at
    FROM users u
    WHERE u.email = user_email 
      AND u.password_hash = crypt(user_password, u.password_hash)
      AND u.deleted_at IS NULL;
END;
$verify_fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, permission_name TEXT) 
RETURNS BOOLEAN AS $has_perm_fn$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    IF user_role = 'subadmin' THEN
        SELECT permissions INTO user_permissions FROM admin_permissions WHERE user_id = user_uuid;
        IF user_permissions IS NULL THEN
            RETURN false;
        END IF;
        RETURN user_permissions ? permission_name;
    END IF;
    
    RETURN false;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN false;
END;
$has_perm_fn$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID) 
RETURNS JSONB AS $get_perm_fn$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    
    IF user_role = 'admin' THEN
        RETURN '["*"]'::jsonb;
    END IF;
    
    IF user_role = 'subadmin' THEN
        SELECT permissions INTO user_permissions FROM admin_permissions WHERE user_id = user_uuid;
        RETURN COALESCE(user_permissions, '[]'::jsonb);
    END IF;
    
    RETURN '[]'::jsonb;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN '[]'::jsonb;
END;
$get_perm_fn$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID) 
RETURNS BOOLEAN AS $super_admin_fn$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN false;
END;
$super_admin_fn$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Contact Requests Indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_created ON contact_requests(user_id, created_at DESC);

-- Consultation Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_created ON consultation_bookings(user_id, created_at DESC);

-- Blog Posts Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug) WHERE slug IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id) WHERE deleted_at IS NULL;

-- Services Indexes
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- AI Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON ai_messages(conversation_id, created_at ASC);

-- ============================================================================
-- Create Triggers for Updated At
-- ============================================================================

-- Contact Requests Trigger
DROP TRIGGER IF EXISTS trigger_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER trigger_contact_requests_updated_at 
    BEFORE UPDATE ON contact_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Consultation Bookings Trigger
DROP TRIGGER IF EXISTS trigger_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER trigger_consultation_bookings_updated_at 
    BEFORE UPDATE ON consultation_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Blog Posts Trigger
DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Services Trigger
DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- AI Conversations Trigger
DROP TRIGGER IF EXISTS trigger_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER trigger_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Add Sample Data
-- ============================================================================

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status) WHERE approval_status IS NOT NULL;

-- Admin permissions indexes
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON admin_permissions(user_id);

-- Employer approvals indexes
CREATE INDEX IF NOT EXISTS idx_employer_approvals_user_id ON employer_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_approvals_status ON employer_approvals(status);

-- Job applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_position ON job_applications(position);

-- Contact Requests Indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_created ON contact_requests(user_id, created_at DESC);

-- Consultation Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_created ON consultation_bookings(user_id, created_at DESC);

-- Blog Posts Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug) WHERE slug IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id) WHERE deleted_at IS NULL;

-- Services Indexes
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- AI Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON ai_messages(conversation_id, created_at ASC);

-- ============================================================================
-- Create Triggers for Updated At
-- ============================================================================

-- Users Trigger
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Admin Permissions Trigger
DROP TRIGGER IF EXISTS trigger_admin_permissions_updated_at ON admin_permissions;
CREATE TRIGGER trigger_admin_permissions_updated_at 
    BEFORE UPDATE ON admin_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Employer Approvals Trigger
DROP TRIGGER IF EXISTS trigger_employer_approvals_updated_at ON employer_approvals;
CREATE TRIGGER trigger_employer_approvals_updated_at 
    BEFORE UPDATE ON employer_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Job Applications Trigger
DROP TRIGGER IF EXISTS trigger_job_applications_updated_at ON job_applications;
CREATE TRIGGER trigger_job_applications_updated_at 
    BEFORE UPDATE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Contact Requests Trigger
DROP TRIGGER IF EXISTS trigger_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER trigger_contact_requests_updated_at 
    BEFORE UPDATE ON contact_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Consultation Bookings Trigger
DROP TRIGGER IF EXISTS trigger_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER trigger_consultation_bookings_updated_at 
    BEFORE UPDATE ON consultation_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Blog Posts Trigger
DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Services Trigger
DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- AI Conversations Trigger
DROP TRIGGER IF EXISTS trigger_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER trigger_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
INSERT INTO contact_requests (name, email, phone, business_type, message, status)
SELECT * FROM (VALUES
    ('أحمد محمد', 'ahmed@example.com', '+966501234567', 'تجارة', 'أحتاج استشارة في إدارة الأعمال', 'new'),
    ('فاطمة علي', 'fatima@example.com', '+966507654321', 'خدمات', 'استفسار عن خدمات الموارد البشرية', 'pending'),
    ('محمد سالم', 'mohammed@example.com', '+966509876543', 'صناعة', 'أريد تطوير استراتيجية الشركة', 'resolved')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM contact_requests LIMIT 1);

-- Sample Consultation Bookings
INSERT INTO consultation_bookings (name, email, phone, company, service_type, preferred_date, preferred_time, notes, status)
SELECT * FROM (VALUES
    ('سارة أحمد', 'sara@company.com', '+966501111111', 'شركة التقنية المتقدمة', 'استشارة إدارية', '2024-12-25', '10:00 AM', 'استشارة حول تطوير الهيكل التنظيمي', 'pending'),
    ('خالد محمد', 'khalid@business.com', '+966502222222', 'مؤسسة الأعمال الذكية', 'تطوير الموارد البشرية', '2024-12-26', '2:00 PM', 'تحسين عمليات التوظيف', 'confirmed'),
    ('نورا سالم', 'nora@enterprise.com', '+966503333333', 'شركة المستقبل', 'استراتيجية الأعمال', '2024-12-27', '11:00 AM', 'وضع خطة استراتيجية خمسية', 'completed')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM consultation_bookings LIMIT 1);

-- Sample Blog Posts
INSERT INTO blog_posts (title, excerpt, content, author, category, image_url, slug)
SELECT * FROM (VALUES
    ('كيف تبني استراتيجية عمل ناجحة في 2025', 'دليل شامل لبناء استراتيجية عمل قوية تساعدك على تحقيق أهدافك وتجاوز المنافسين', 'في عالم الأعمال المتغير باستمرار، تعد الاستراتيجية الواضحة والمدروسة هي مفتاح النجاح. في هذا المقال، سنستعرض الخطوات الأساسية لبناء استراتيجية عمل ناجحة تتضمن تحليل السوق، تحديد الأهداف الذكية، وبناء خطة تنفيذية قابلة للقياس. نبدأ بتحليل البيئة الداخلية والخارجية للشركة، ثم نحدد الرؤية والرسالة، وننتهي بوضع خطة عمل قابلة للتطبيق والقياس.', 'فريق SCK', 'استراتيجية', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop', 'business-strategy-2025'),
    ('أهمية الموارد البشرية في نجاح الشركات', 'كيف يمكن لإدارة الموارد البشرية الفعالة أن تحدث فرقاً كبيراً في أداء شركتك', 'الموارد البشرية هي العمود الفقري لأي منظمة ناجحة. في هذا المقال، نستكشف كيف يمكن لاستراتيجية موارد بشرية قوية أن تحول أداء شركتك من خلال التوظيف الذكي، تطوير المواهب، وبناء ثقافة عمل محفزة. سنتناول أفضل الممارسات في اختيار المواهب، برامج التدريب والتطوير، وأنظمة تقييم الأداء التي تحفز الموظفين على الإبداع والإنتاجية.', 'فريق SCK', 'موارد بشرية', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop', 'hr-importance-success'),
    ('التحول الرقمي: ضرورة أم خيار؟', 'لماذا أصبح التحول الرقمي ضرورة حتمية للشركات في العصر الحديث', 'في عصر التكنولوجيا المتسارع، لم يعد التحول الرقمي خياراً بل ضرورة للبقاء والمنافسة. نستعرض في هذا المقال أهمية التحول الرقمي وكيفية تطبيقه بنجاح في شركتك. من أتمتة العمليات إلى تحليل البيانات الضخمة، ومن التجارة الإلكترونية إلى الذكاء الاصطناعي، سنوضح كيف يمكن للتقنيات الحديثة أن تحسن من كفاءة العمل وتزيد من رضا العملاء.', 'فريق SCK', 'تكنولوجيا', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop', 'digital-transformation-necessity')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

-- Sample Services
INSERT INTO services (name, description, price_range, is_active)
SELECT * FROM (VALUES
    ('الاستشارات الإدارية', 'خدمات استشارية شاملة في مجال الإدارة والتطوير التنظيمي', '5000 - 15000 ريال', true),
    ('تطوير الموارد البشرية', 'برامج تدريب وتطوير الكوادر البشرية وأنظمة إدارة الأداء', '3000 - 10000 ريال', true),
    ('التخطيط الاستراتيجي', 'وضع الخطط الاستراتيجية طويلة المدى وتحليل السوق', '8000 - 25000 ريال', true),
    ('إدارة المشاريع', 'خدمات إدارة وتنفيذ المشاريع باستخدام أحدث المنهجيات', '4000 - 12000 ريال', true)
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- ============================================================================
-- Add Sample Data for Testing
-- ============================================================================

-- Sample Contact Requests
INSERT INTO contact_requests (name, email, phone, business_type, message, status)
SELECT * FROM (VALUES
    ('أحمد محمد', 'ahmed@example.com', '+966501234567', 'تجارة', 'أحتاج استشارة في إدارة الأعمال', 'new'),
    ('فاطمة علي', 'fatima@example.com', '+966507654321', 'خدمات', 'استفسار عن خدمات الموارد البشرية', 'pending'),
    ('محمد سالم', 'mohammed@example.com', '+966509876543', 'صناعة', 'أريد تطوير استراتيجية الشركة', 'resolved')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM contact_requests LIMIT 1);

-- Sample Consultation Bookings
INSERT INTO consultation_bookings (name, email, phone, company, service_type, preferred_date, preferred_time, notes, status)
SELECT * FROM (VALUES
    ('سارة أحمد', 'sara@company.com', '+966501111111', 'شركة التقنية المتقدمة', 'استشارة إدارية', '2024-12-25', '10:00 AM', 'استشارة حول تطوير الهيكل التنظيمي', 'pending'),
    ('خالد محمد', 'khalid@business.com', '+966502222222', 'مؤسسة الأعمال الذكية', 'تطوير الموارد البشرية', '2024-12-26', '2:00 PM', 'تحسين عمليات التوظيف', 'confirmed'),
    ('نورا سالم', 'nora@enterprise.com', '+966503333333', 'شركة المستقبل', 'استراتيجية الأعمال', '2024-12-27', '11:00 AM', 'وضع خطة استراتيجية خمسية', 'completed')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM consultation_bookings LIMIT 1);

-- Sample Blog Posts
INSERT INTO blog_posts (title, excerpt, content, author, category, image_url, slug)
SELECT * FROM (VALUES
    ('كيف تبني استراتيجية عمل ناجحة في 2025', 'دليل شامل لبناء استراتيجية عمل قوية تساعدك على تحقيق أهدافك وتجاوز المنافسين', 'في عالم الأعمال المتغير باستمرار، تعد الاستراتيجية الواضحة والمدروسة هي مفتاح النجاح. في هذا المقال، سنستعرض الخطوات الأساسية لبناء استراتيجية عمل ناجحة تتضمن تحليل السوق، تحديد الأهداف الذكية، وبناء خطة تنفيذية قابلة للقياس. نبدأ بتحليل البيئة الداخلية والخارجية للشركة، ثم نحدد الرؤية والرسالة، وننتهي بوضع خطة عمل قابلة للتطبيق والقياس.', 'فريق SCK', 'استراتيجية', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop', 'business-strategy-2025'),
    ('أهمية الموارد البشرية في نجاح الشركات', 'كيف يمكن لإدارة الموارد البشرية الفعالة أن تحدث فرقاً كبيراً في أداء شركتك', 'الموارد البشرية هي العمود الفقري لأي منظمة ناجحة. في هذا المقال، نستكشف كيف يمكن لاستراتيجية موارد بشرية قوية أن تحول أداء شركتك من خلال التوظيف الذكي، تطوير المواهب، وبناء ثقافة عمل محفزة. سنتناول أفضل الممارسات في اختيار المواهب، برامج التدريب والتطوير، وأنظمة تقييم الأداء التي تحفز الموظفين على الإبداع والإنتاجية.', 'فريق SCK', 'موارد بشرية', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop', 'hr-importance-success'),
    ('التحول الرقمي: ضرورة أم خيار؟', 'لماذا أصبح التحول الرقمي ضرورة حتمية للشركات في العصر الحديث', 'في عصر التكنولوجيا المتسارع، لم يعد التحول الرقمي خياراً بل ضرورة للبقاء والمنافسة. نستعرض في هذا المقال أهمية التحول الرقمي وكيفية تطبيقه بنجاح في شركتك. من أتمتة العمليات إلى تحليل البيانات الضخمة، ومن التجارة الإلكترونية إلى الذكاء الاصطناعي، سنوضح كيف يمكن للتقنيات الحديثة أن تحسن من كفاءة العمل وتزيد من رضا العملاء.', 'فريق SCK', 'تكنولوجيا', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop', 'digital-transformation-necessity')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

-- Sample Services
INSERT INTO services (name, description, price_range, is_active)
SELECT * FROM (VALUES
    ('الاستشارات الإدارية', 'خدمات استشارية شاملة في مجال الإدارة والتطوير التنظيمي', '5000 - 15000 ريال', true),
    ('تطوير الموارد البشرية', 'برامج تدريب وتطوير الكوادر البشرية وأنظمة إدارة الأداء', '3000 - 10000 ريال', true),
    ('التخطيط الاستراتيجي', 'وضع الخطط الاستراتيجية طويلة المدى وتحليل السوق', '8000 - 25000 ريال', true),
    ('إدارة المشاريع', 'خدمات إدارة وتنفيذ المشاريع باستخدام أحدث المنهجيات', '4000 - 12000 ريال', true)
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Sample Job Applications
INSERT INTO job_applications (full_name, email, phone, position, experience_years, education, cv_url, cover_letter, linkedin_url, status)
SELECT * FROM (VALUES
    ('علي أحمد محمد', 'ali.ahmed@email.com', '+966501234567', 'مستشار إداري', 5, 'بكالوريوس إدارة أعمال', 'https://example.com/cv1.pdf', 'أتطلع للانضمام لفريقكم المتميز', 'https://linkedin.com/in/ali-ahmed', 'pending'),
    ('نورا سالم العتيبي', 'nora.salem@email.com', '+966507654321', 'أخصائي موارد بشرية', 3, 'بكالوريوس علم نفس', 'https://example.com/cv2.pdf', 'خبرة واسعة في إدارة الموارد البشرية', 'https://linkedin.com/in/nora-salem', 'reviewing'),
    ('محمد خالد الشمري', 'mohammed.khalid@email.com', '+966509876543', 'محلل أعمال', 4, 'ماجستير إدارة أعمال', 'https://example.com/cv3.pdf', 'متخصص في تحليل العمليات وتطويرها', 'https://linkedin.com/in/mohammed-khalid', 'shortlisted')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM job_applications LIMIT 1);

-- ============================================================================
-- Final Verification and Cleanup
-- ============================================================================

-- Re-enable RLS (Row Level Security) but with permissive policies for admin access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for admin access
DROP POLICY IF EXISTS "Allow admin full access" ON users;
CREATE POLICY "Allow admin full access" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin full access" ON contact_requests;
CREATE POLICY "Allow admin full access" ON contact_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin full access" ON consultation_bookings;
CREATE POLICY "Allow admin full access" ON consultation_bookings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin full access" ON blog_posts;
CREATE POLICY "Allow admin full access" ON blog_posts FOR ALL USING (true);

-- ============================================================================
-- Final Verification Report
-- ============================================================================

DO $do4$
DECLARE
    users_count INTEGER;
    contact_count INTEGER;
    booking_count INTEGER;
    blog_count INTEGER;
    service_count INTEGER;
    job_count INTEGER;
    admin_exists BOOLEAN;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO users_count FROM users;
    SELECT COUNT(*) INTO contact_count FROM contact_requests;
    SELECT COUNT(*) INTO booking_count FROM consultation_bookings;
    SELECT COUNT(*) INTO blog_count FROM blog_posts;
    SELECT COUNT(*) INTO service_count FROM services;
    SELECT COUNT(*) INTO job_count FROM job_applications;
    
    -- Check admin
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@sck.com' AND role = 'admin') INTO admin_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users: % (Admin exists: %)', users_count, admin_exists;
    RAISE NOTICE 'Contact Requests: %', contact_count;
    RAISE NOTICE 'Consultation Bookings: %', booking_count;
    RAISE NOTICE 'Blog Posts: %', blog_count;
    RAISE NOTICE 'Services: %', service_count;
    RAISE NOTICE 'Job Applications: %', job_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Login Credentials:';
    RAISE NOTICE '   Email: admin@sck.com';
    RAISE NOTICE '   Password: scq2025';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Next Steps:';
    RAISE NOTICE '   1. Deploy to Vercel with Environment Variables';
    RAISE NOTICE '   2. Test login at: https://sck-tawny.vercel.app/login';
    RAISE NOTICE '   3. Run: node test-complete-system.js';
    RAISE NOTICE '========================================';
END $do4$;