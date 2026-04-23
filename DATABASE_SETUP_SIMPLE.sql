-- ============================================================================
-- Simple Database Setup for SCK Platform - NO ERRORS VERSION
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Users Table
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

-- Create Admin Permissions Table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create Contact Requests Table
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

-- Create Consultation Bookings Table
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

-- Create Blog Posts Table
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

-- Create Services Table
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

-- Create Job Applications Table
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

-- Create Employer Approvals Table
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

-- Create Functions
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $verify_fn$
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
$verify_fn$;

-- Create Super Admin
INSERT INTO users (email, password_hash, full_name, role, is_active, metadata)
VALUES (
    'admin@sck.com',
    crypt('scq2025', gen_salt('bf', 10)),
    'Super Admin',
    'admin',
    true,
    '{"is_default_admin": true}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('scq2025', gen_salt('bf', 10)),
    is_active = true,
    role = 'admin';

-- Create Triggers (Drop first if exists)
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_permissions_updated_at ON admin_permissions;
CREATE TRIGGER trigger_admin_permissions_updated_at 
    BEFORE UPDATE ON admin_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER trigger_contact_requests_updated_at 
    BEFORE UPDATE ON contact_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER trigger_consultation_bookings_updated_at 
    BEFORE UPDATE ON consultation_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_job_applications_updated_at ON job_applications;
CREATE TRIGGER trigger_job_applications_updated_at 
    BEFORE UPDATE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_employer_approvals_updated_at ON employer_approvals;
CREATE TRIGGER trigger_employer_approvals_updated_at 
    BEFORE UPDATE ON employer_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Success Message
SELECT 'Database setup completed successfully! Login: admin@sck.com / scq2025' AS result;