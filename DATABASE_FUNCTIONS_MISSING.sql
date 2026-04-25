-- Missing Database Functions for SCK Platform

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create subadmin user
CREATE OR REPLACE FUNCTION create_subadmin_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO users (email, password_hash, full_name, phone, company, role, is_active)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf', 10)),
        p_full_name,
        p_phone,
        p_company,
        'subadmin',
        true
    )
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL),
        'active_users', (SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL),
        'admin_users', (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'subadmin') AND deleted_at IS NULL),
        'employer_users', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND deleted_at IS NULL),
        'regular_users', (SELECT COUNT(*) FROM users WHERE role = 'user' AND deleted_at IS NULL),
        'pending_employers', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND approval_status = 'pending' AND deleted_at IS NULL),
        'approved_employers', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND approval_status = 'approved' AND deleted_at IS NULL),
        'total_contacts', (SELECT COUNT(*) FROM contact_requests),
        'pending_contacts', (SELECT COUNT(*) FROM contact_requests WHERE status = 'pending'),
        'total_bookings', (SELECT COUNT(*) FROM consultation_bookings),
        'pending_bookings', (SELECT COUNT(*) FROM consultation_bookings WHERE status = 'pending'),
        'total_blog_posts', (SELECT COUNT(*) FROM blog_posts WHERE deleted_at IS NULL),
        'published_blog_posts', (SELECT COUNT(*) FROM blog_posts WHERE is_published = true AND deleted_at IS NULL)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_subadmin_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- Success message
SELECT 'Missing database functions created successfully!' AS result;