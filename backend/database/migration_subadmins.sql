-- ============================================================================
-- Sub-Admins & Permissions System Migration
-- Adds support for granular permissions and employer approval workflow
-- ============================================================================

-- ===================== NEW TABLES =====================

-- Sub-Admin Permissions Table
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

-- Employer Approval Workflow
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

-- ===================== ADD COLUMNS TO EXISTING TABLES =====================

DO $
BEGIN
    -- Add is_approved column to users table for employers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_approved') THEN
        ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT NULL;
        -- NULL = not applicable (regular users), true = approved, false = pending/rejected
    END IF;
    
    -- Add approval_status for quick filtering
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='approval_status') THEN
        ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT NULL 
            CHECK (approval_status IN ('pending', 'approved', 'rejected', NULL));
    END IF;
END $;

-- ===================== INDEXES =====================

CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_approvals_user_id ON employer_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_approvals_status ON employer_approvals(status);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status) WHERE approval_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_approved ON users(role, is_approved) WHERE role = 'employer';

-- ===================== FUNCTIONS =====================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, permission_name TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    
    -- Super Admin has all permissions
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Sub-Admin: check permissions
    IF user_role = 'subadmin' THEN
        SELECT permissions INTO user_permissions FROM admin_permissions WHERE user_id = user_uuid;
        
        IF user_permissions IS NULL THEN
            RETURN false;
        END IF;
        
        -- Check if permission exists in array
        RETURN user_permissions ? permission_name;
    END IF;
    
    RETURN false;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID) 
RETURNS JSONB AS $$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_uuid AND is_active = true AND deleted_at IS NULL;
    
    -- Super Admin has all permissions
    IF user_role = 'admin' THEN
        RETURN '["*"]'::jsonb;
    END IF;
    
    -- Sub-Admin: return their permissions
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

-- Function to check if user is Super Admin
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

-- ===================== TRIGGERS =====================

DO $
BEGIN
    -- Trigger for admin_permissions updated_at
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_admin_permissions_updated_at') THEN
        CREATE TRIGGER trigger_admin_permissions_updated_at 
            BEFORE UPDATE ON admin_permissions 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    
    -- Trigger for employer_approvals updated_at
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_employer_approvals_updated_at') THEN
        CREATE TRIGGER trigger_employer_approvals_updated_at 
            BEFORE UPDATE ON employer_approvals 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    
    -- Audit triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_admin_permissions_trigger') THEN
        CREATE TRIGGER audit_admin_permissions_trigger 
            AFTER INSERT OR UPDATE OR DELETE ON admin_permissions 
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_employer_approvals_trigger') THEN
        CREATE TRIGGER audit_employer_approvals_trigger 
            AFTER INSERT OR UPDATE OR DELETE ON employer_approvals 
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
END $;

-- ===================== RLS POLICIES =====================

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_approvals ENABLE ROW LEVEL SECURITY;

DO $
BEGIN
    -- Admin Permissions: Only Super Admin can manage
    DROP POLICY IF EXISTS admin_permissions_super_admin_only ON admin_permissions;
    CREATE POLICY admin_permissions_super_admin_only ON admin_permissions 
        FOR ALL USING (is_super_admin(auth.uid()));
    
    -- Employer Approvals: Employers can view their own, Admins can manage all
    DROP POLICY IF EXISTS employer_approvals_select ON employer_approvals;
    CREATE POLICY employer_approvals_select ON employer_approvals 
        FOR SELECT USING (user_id = auth.uid() OR is_admin());
    
    DROP POLICY IF EXISTS employer_approvals_insert ON employer_approvals;
    CREATE POLICY employer_approvals_insert ON employer_approvals 
        FOR INSERT WITH CHECK (user_id = auth.uid());
    
    DROP POLICY IF EXISTS employer_approvals_update_admin ON employer_approvals;
    CREATE POLICY employer_approvals_update_admin ON employer_approvals 
        FOR UPDATE USING (is_admin());
    
    DROP POLICY IF EXISTS employer_approvals_delete_admin ON employer_approvals;
    CREATE POLICY employer_approvals_delete_admin ON employer_approvals 
        FOR DELETE USING (is_admin());
END $;

-- ===================== DATA MIGRATION =====================

-- Create employer approval records for existing employers
INSERT INTO employer_approvals (user_id, status, approved_at)
SELECT id, 'approved', created_at
FROM users
WHERE role = 'employer' 
  AND deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM employer_approvals WHERE user_id = users.id)
ON CONFLICT (user_id) DO NOTHING;

-- Update users table with approval status
UPDATE users u
SET 
    is_approved = CASE 
        WHEN u.role = 'employer' THEN 
            COALESCE((SELECT status = 'approved' FROM employer_approvals WHERE user_id = u.id), false)
        ELSE NULL
    END,
    approval_status = CASE 
        WHEN u.role = 'employer' THEN 
            COALESCE((SELECT status FROM employer_approvals WHERE user_id = u.id), 'pending')
        ELSE NULL
    END
WHERE u.role = 'employer' AND u.deleted_at IS NULL;

-- ===================== SEED DEFAULT SUPER ADMIN =====================

-- Insert default Super Admin if not exists
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    role, 
    is_active,
    metadata
)
SELECT 
    'admin@sck.com',
    crypt('scq2025', gen_salt('bf', 10)), -- bcrypt hash
    'Super Admin',
    'admin',
    true,
    '{"is_default_admin": true}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@sck.com' OR (role = 'admin' AND metadata->>'is_default_admin' = 'true')
)
ON CONFLICT (email) DO NOTHING;

-- ===================== COMMENTS =====================

COMMENT ON TABLE admin_permissions IS 'Stores granular permissions for sub-admin users';
COMMENT ON TABLE employer_approvals IS 'Tracks approval workflow for employer accounts';
COMMENT ON COLUMN users.is_approved IS 'NULL for non-employers, true/false for employers approval status';
COMMENT ON COLUMN users.approval_status IS 'Quick status check: pending, approved, rejected';
COMMENT ON FUNCTION has_permission IS 'Check if user has specific permission';
COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for a user';
COMMENT ON FUNCTION is_super_admin IS 'Check if user is Super Admin';

-- ===================== VERIFICATION =====================

-- Verify tables created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('admin_permissions', 'employer_approvals')) = 2,
        'Migration failed: Tables not created';
    
    RAISE NOTICE '✅ Sub-Admins & Permissions Migration Complete';
    RAISE NOTICE '   - admin_permissions table created';
    RAISE NOTICE '   - employer_approvals table created';
    RAISE NOTICE '   - Permission functions added';
    RAISE NOTICE '   - RLS policies configured';
    RAISE NOTICE '   - Default Super Admin created';
END $$;
