-- Create simple login function that returns user if password matches
DROP FUNCTION IF EXISTS login_user(TEXT, TEXT);

CREATE OR REPLACE FUNCTION login_user(
    p_email TEXT,
    p_password TEXT
)
RETURNS TABLE(
    id UUID,
    email VARCHAR(255),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20),
    is_active BOOLEAN,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.company,
        u.role,
        u.is_active,
        u.last_login_at,
        u.metadata,
        u.created_at,
        u.updated_at
    FROM users u
    WHERE u.email = p_email
      AND u.password_hash = crypt(p_password, u.password_hash)
      AND u.deleted_at IS NULL;
END;
$$;

-- Test it
SELECT 
    'Login Function Test' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCCESS - Login will work!'
        ELSE '❌ FAILED - Check password'
    END as result,
    COUNT(*) as user_found
FROM login_user('admin@sck.com', 'scq2025');

-- Show actual data
SELECT * FROM login_user('admin@sck.com', 'scq2025');
