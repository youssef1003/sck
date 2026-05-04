-- ============================================================================
-- Additional Database Functions for SCK Platform
-- ============================================================================

-- Function to create sub-admin user with proper password hashing
CREATE OR REPLACE FUNCTION create_subadmin_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert new user with hashed password
    INSERT INTO users (
        email,
        password_hash,
        full_name,
        phone,
        company,
        role,
        is_active
    ) VALUES (
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
$$;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users', json_build_object(
            'total', (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL),
            'active', (SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL),
            'clients', (SELECT COUNT(*) FROM users WHERE role = 'client' AND deleted_at IS NULL),
            'employers', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND deleted_at IS NULL),
            'subadmins', (SELECT COUNT(*) FROM users WHERE role = 'subadmin' AND deleted_at IS NULL)
        ),
        'contacts', json_build_object(
            'total', (SELECT COUNT(*) FROM contact_requests WHERE deleted_at IS NULL),
            'new', (SELECT COUNT(*) FROM contact_requests WHERE status = 'new' AND deleted_at IS NULL),
            'pending', (SELECT COUNT(*) FROM contact_requests WHERE status = 'pending' AND deleted_at IS NULL),
            'resolved', (SELECT COUNT(*) FROM contact_requests WHERE status = 'resolved' AND deleted_at IS NULL)
        ),
        'bookings', json_build_object(
            'total', (SELECT COUNT(*) FROM consultation_bookings WHERE deleted_at IS NULL),
            'pending', (SELECT COUNT(*) FROM consultation_bookings WHERE status = 'pending' AND deleted_at IS NULL),
            'confirmed', (SELECT COUNT(*) FROM consultation_bookings WHERE status = 'confirmed' AND deleted_at IS NULL),
            'completed', (SELECT COUNT(*) FROM consultation_bookings WHERE status = 'completed' AND deleted_at IS NULL)
        ),
        'blog', json_build_object(
            'total', (SELECT COUNT(*) FROM blog_posts WHERE deleted_at IS NULL),
            'published', (SELECT COUNT(*) FROM blog_posts WHERE is_published = true AND deleted_at IS NULL),
            'drafts', (SELECT COUNT(*) FROM blog_posts WHERE is_published = false AND deleted_at IS NULL)
        ),
        'employers', json_build_object(
            'total', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND deleted_at IS NULL),
            'pending', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND approval_status = 'pending' AND deleted_at IS NULL),
            'approved', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND approval_status = 'approved' AND deleted_at IS NULL),
            'rejected', (SELECT COUNT(*) FROM users WHERE role = 'employer' AND approval_status = 'rejected' AND deleted_at IS NULL)
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to backup all data
CREATE OR REPLACE FUNCTION backup_all_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'backup_date', NOW(),
        'users', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'email', email,
                    'full_name', full_name,
                    'phone', phone,
                    'company', company,
                    'role', role,
                    'is_active', is_active,
                    'is_approved', is_approved,
                    'approval_status', approval_status,
                    'created_at', created_at,
                    'updated_at', updated_at
                )
            )
            FROM users 
            WHERE deleted_at IS NULL
        ),
        'contact_requests', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'name', name,
                    'email', email,
                    'phone', phone,
                    'business_type', business_type,
                    'message', message,
                    'status', status,
                    'created_at', created_at
                )
            )
            FROM contact_requests 
            WHERE deleted_at IS NULL
        ),
        'consultation_bookings', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'name', name,
                    'email', email,
                    'phone', phone,
                    'company', company,
                    'service_type', service_type,
                    'preferred_date', preferred_date,
                    'preferred_time', preferred_time,
                    'notes', notes,
                    'status', status,
                    'created_at', created_at
                )
            )
            FROM consultation_bookings 
            WHERE deleted_at IS NULL
        ),
        'blog_posts', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'slug', slug,
                    'excerpt', excerpt,
                    'content', content,
                    'author', author,
                    'category', category,
                    'image_url', image_url,
                    'is_published', is_published,
                    'published_at', published_at,
                    'created_at', created_at
                )
            )
            FROM blog_posts 
            WHERE deleted_at IS NULL
        ),
        'admin_permissions', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'user_id', user_id,
                    'permissions', permissions,
                    'created_at', created_at
                )
            )
            FROM admin_permissions
        ),
        'employer_approvals', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'user_id', user_id,
                    'status', status,
                    'approved_by', approved_by,
                    'approved_at', approved_at,
                    'rejection_reason', rejection_reason,
                    'created_at', created_at
                )
            )
            FROM employer_approvals
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Success message
SELECT 'Database functions created successfully!' AS result;