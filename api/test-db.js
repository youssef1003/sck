/**
 * Database Connection Test Endpoint
 * Tests Supabase connection and login_user function
 * REMOVE THIS FILE AFTER DEBUGGING
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!SUPABASE_URL,
        supabaseUrlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : null,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
        supabaseKeyPrefix: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.substring(0, 20) + '...' : null
      },
      tests: {}
    }

    // Test 1: Check if users table exists
    console.log('Test 1: Checking users table...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('email', 'admin@sck.com')
      .single()

    results.tests.usersTable = {
      success: !usersError,
      error: usersError?.message,
      userFound: !!usersData,
      userEmail: usersData?.email,
      userRole: usersData?.role,
      userActive: usersData?.is_active
    }

    // Test 2: Check if login_user function exists
    console.log('Test 2: Testing login_user function...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('login_user', {
      p_email: 'admin@sck.com',
      p_password: 'scq2025'
    })

    results.tests.loginUserFunction = {
      success: !rpcError,
      error: rpcError?.message,
      errorCode: rpcError?.code,
      errorDetails: rpcError?.details,
      errorHint: rpcError?.hint,
      hasData: !!rpcData,
      isArray: Array.isArray(rpcData),
      dataLength: Array.isArray(rpcData) ? rpcData.length : (rpcData ? 1 : 0),
      userFound: Array.isArray(rpcData) ? rpcData.length > 0 : !!rpcData,
      userEmail: Array.isArray(rpcData) && rpcData[0] ? rpcData[0].email : rpcData?.email,
      userRole: Array.isArray(rpcData) && rpcData[0] ? rpcData[0].role : rpcData?.role
    }

    // Test 3: Check password hash
    console.log('Test 3: Checking password hash...')
    const { data: hashData, error: hashError } = await supabase
      .from('users')
      .select('email, password_hash')
      .eq('email', 'admin@sck.com')
      .single()

    results.tests.passwordHash = {
      success: !hashError,
      error: hashError?.message,
      hasPasswordHash: !!hashData?.password_hash,
      passwordHashPrefix: hashData?.password_hash ? hashData.password_hash.substring(0, 20) + '...' : null
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection test completed',
      results
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    })
  }
}
