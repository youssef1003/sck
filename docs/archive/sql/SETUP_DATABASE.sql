-- ============================================================================
-- SCK Consulting Platform - Complete Database Setup
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: Create all tables (if not exist)
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20) DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT NULL,
    approval_status VARCHAR(20) DEFAULT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_permissions UNIQUE(user_id)
);

-- Employer approvals table
CREATE TABLE IF NOT EXISTS employer_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_employer_approval UNIQUE(user_id)
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL,
    education VARCHAR(200) NOT NULL,
    cv_url TEXT,
    cover_letter TEXT,
    linkedin_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create Super Admin (if not exists)
-- ============================================================================

DO $$
BEGIN
    -- Check if Super Admin exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sck.com') THEN
        -- Insert Super Admin
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
        RAISE NOTICE '   Email: admin@sck.com';
        RAISE NOTICE '   Password: scq2025';
    ELSE
        RAISE NOTICE '✅ Super Admin already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Create Functions
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, permission_name TEXT) 
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID) 
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID) 
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 4: Create Triggers
-- ============================================================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_permissions_updated_at ON admin_permissions;
CREATE TRIGGER trigger_admin_permissions_updated_at 
    BEFORE UPDATE ON admin_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_employer_approvals_updated_at ON employer_approvals;
CREATE TRIGGER trigger_employer_approvals_updated_at 
    BEFORE UPDATE ON employer_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_job_applications_updated_at ON job_applications;
CREATE TRIGGER trigger_job_applications_updated_at 
    BEFORE UPDATE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- STEP 5: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status) WHERE approval_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_approvals_user_id ON employer_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_approvals_status ON employer_approvals(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_position ON job_applications(position);

-- ============================================================================
-- STEP 6: Verification
-- ============================================================================

DO $$
DECLARE
    admin_count INTEGER;
    tables_count INTEGER;
BEGIN
    -- Check Super Admin
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    
    -- Check tables
    SELECT COUNT(*) INTO tables_count 
    FROM information_schema.tables 
    WHERE table_name IN ('users', 'admin_permissions', 'employer_approvals', 'job_applications');
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', tables_count;
    RAISE NOTICE 'Super Admins: %', admin_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Login Credentials:';
    RAISE NOTICE '   Email: admin@sck.com';
    RAISE NOTICE '   Password: scq2025';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Next Steps:';
    RAISE NOTICE '   1. Test Backend: uvicorn main:app --reload';
    RAISE NOTICE '   2. Test Frontend: npm run dev';
    RAISE NOTICE '   3. Login with Super Admin credentials';
    RAISE NOTICE '========================================';
END $$;
