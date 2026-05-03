-- ============================================================================
-- Fix verify_user_password Function - FINAL VERSION
-- ============================================================================

-- Drop old function
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);

-- Create new function with correct return type
CREATE OR REPLACE FUNCTION verify_user_password(
    user_email TEXT, 
    user_password TEXT
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
    WHERE u.email = user_email 
      AND u.password_hash = crypt(user_password, u.password_hash)
      AND u.is_active = true
      AND u.deleted_at IS NULL;
END;
$$;

-- Test the function
SELECT 
    'Function Test' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCCESS - Function works!'
        ELSE '❌ FAILED - Function returns nothing'
    END as result,
    COUNT(*) as rows_returned
FROM verify_user_password('admin@sck.com', 'scq2025');

-- Show the actual data
SELECT 
    '=== Actual Data ===' as separator,
    id,
    email,
    full_name,
    role
FROM verify_user_password('admin@sck.com', 'scq2025');
