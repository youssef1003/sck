-- Test Login Directly in Database
-- This will show us EXACTLY what's wrong

-- Test 1: Check if user exists
SELECT 
    'Test 1: User Exists' as test,
    id,
    email,
    role,
    is_active,
    password_hash IS NOT NULL as has_password
FROM users 
WHERE email = 'admin@sck.com';

-- Test 2: Check if function exists
SELECT 
    'Test 2: Function Exists' as test,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'verify_user_password';

-- Test 3: Try to call function
SELECT 
    'Test 3: Function Call' as test,
    *
FROM verify_user_password('admin@sck.com', 'scq2025');

-- Test 4: Manual password check (bypass function)
SELECT 
    'Test 4: Manual Password Check' as test,
    id,
    email,
    CASE 
        WHEN password_hash = crypt('scq2025', password_hash) THEN '✅ Password CORRECT'
        ELSE '❌ Password WRONG'
    END as password_status
FROM users 
WHERE email = 'admin@sck.com';
