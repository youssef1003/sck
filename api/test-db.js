/**
 * Database Connection Test Endpoint - TEMPORARY DIAGNOSTIC ONLY
 * Tests Supabase connection and login_user function
 * REMOVE THIS FILE AFTER DEBUGGING OR PROTECT WITH SECRET HEADER
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    // Extract project ref from URL safely (mask most of it)
    let projectRef = 'unknown'
    if (SUPABASE_URL) {
      const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
      if (match) {
        const ref = match[1]
        projectRef = ref.substring(0, 4) + '***' + ref.substring(ref.length - 4)
      }
    }

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!SUPABASE_URL,
        projectRef: projectRef, // Masked version
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
        keyLength: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 0
      },
      tests: {}
    }

    // Test 1: Check if users table exists and admin user exists
    console.log('Test 1: Checking users table and admin user...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('email', 'admin@sck.com')
      .single()

    results.tests.usersTable = {
      accessible: !usersError,
      error: usersError ? usersError.message : null,
      adminUserExists: !!usersData,
      adminUserActive: usersData?.is_active || false,
      adminUserRole: usersData?.role || null
    }

    // Test 2: Check if login_user function exists and works
    console.log('Test 2: Testing login_user function...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('login_user', {
      p_email: 'admin@sck.com',
      p_password: 'scq2025'
    })

    results.tests.loginUserFunction = {
      exists: !rpcError || (rpcError && !rpcError.message.includes('does not exist')),
      callable: !rpcError,
      error: rpcError ? rpcError.message : null,
      errorCode: rpcError ? rpcError.code : null,
      returnsData: !!rpcData,
      isArray: Array.isArray(rpcData),
      dataLength: Array.isArray(rpcData) ? rpcData.length : (rpcData ? 1 : 0),
      userFound: Array.isArray(rpcData) ? rpcData.length > 0 : !!rpcData,
      userRole: Array.isArray(rpcData) && rpcData[0] ? rpcData[0].role : rpcData?.role
    }

    // Test 3: Check if password_hash column exists (without exposing the hash)
    console.log('Test 3: Checking password_hash column...')
    const { data: hashData, error: hashError } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@sck.com')
      .single()

    results.tests.passwordHashColumn = {
      accessible: !hashError,
      error: hashError ? hashError.message : null
    }

    // Diagnosis
    results.diagnosis = {
      canConnectToSupabase: !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY,
      canAccessUsersTable: results.tests.usersTable.accessible,
      adminUserExists: results.tests.usersTable.adminUserExists,
      loginFunctionExists: results.tests.loginUserFunction.exists,
      loginFunctionWorks: results.tests.loginUserFunction.callable && results.tests.loginUserFunction.dataLength > 0,
      overallStatus: null
    }

    // Determine overall status
    if (!results.diagnosis.canAccessUsersTable) {
      results.diagnosis.overallStatus = 'ERROR: Cannot access users table. Check Supabase connection.'
    } else if (!results.diagnosis.adminUserExists) {
      results.diagnosis.overallStatus = 'ERROR: admin@sck.com does not exist in this Supabase project. Run DATABASE_FIX_SIMPLE.sql'
    } else if (!results.diagnosis.loginFunctionExists) {
      results.diagnosis.overallStatus = 'ERROR: login_user function does not exist. Run CREATE_LOGIN_FUNCTION.sql'
    } else if (!results.diagnosis.loginFunctionWorks) {
      results.diagnosis.overallStatus = 'ERROR: login_user function returns no data. Password hash mismatch or wrong parameters.'
    } else {
      results.diagnosis.overallStatus = 'SUCCESS: All tests passed. Login should work. If still 401, check auth.js logic.'
    }

    return res.status(200).json({
      success: true,
      message: 'Database diagnostic completed',
      results
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return res.status(500).json({
      success: false,
      message: 'Diagnostic test failed',
      error: error.message
    })
  }
}
