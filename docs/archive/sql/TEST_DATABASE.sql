-- ============================================================================
-- Test Database Setup - Run this to verify everything is working
-- ============================================================================

-- Test 1: Check if Super Admin exists
SELECT 
    'Test 1: Super Admin Exists' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result,
    COUNT(*) as admin_count
FROM users 
WHERE email = 'admin@sck.com' 
  AND deleted_at IS NULL;

-- Test 2: Check if password_hash column exists
SELECT 
    'Test 2: password_hash Column' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'password_hash';

-- Test 3: Check if verify_user_password function exists
SELECT 
    'Test 3: verify_user_password Function' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result
FROM information_schema.routines 
WHERE routine_name = 'verify_user_password';

-- Test 4: Try to verify Super Admin password
DO $$
DECLARE
    test_result RECORD;
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count 
    FROM verify_user_password('admin@sck.com', 'scq2025');
    
    IF result_count > 0 THEN
        RAISE NOTICE '✅ Test 4: Password Verification - PASS';
        RAISE NOTICE '   Super Admin login works!';
    ELSE
        RAISE NOTICE '❌ Test 4: Password Verification - FAIL';
        RAISE NOTICE '   Super Admin login does NOT work!';
        RAISE NOTICE '   Need to reset password!';
    END IF;
END $$;

-- Test 5: Check chat tables
SELECT 
    'Test 5: Chat Tables' as test_name,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result,
    COUNT(*) as tables_count
FROM information_schema.tables 
WHERE table_name IN ('chat_conversations', 'chat_messages', 'rag_documents');

-- Test 6: Check RAG documents
SELECT 
    'Test 6: RAG Documents' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result,
    COUNT(*) as documents_count
FROM rag_documents;

-- Summary
SELECT 
    '==================' as separator,
    'SUMMARY' as title,
    '==================' as separator2;

SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Chat Conversations',
    COUNT(*)
FROM chat_conversations
UNION ALL
SELECT 
    'RAG Documents',
    COUNT(*)
FROM rag_documents;
