/**
 * Database Connection Test Endpoint - PROTECTED
 * Tests Supabase connection and login_user function
 * REQUIRES DEBUG_SECRET header in production
 */

const { createClient } = require('@supabase/supabase-js')

// Safely trim and clean environment variables
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '') || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '') || ''
const DEBUG_SECRET = process.env.DEBUG_SECRET

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Require DEBUG_SECRET in production
  if (DEBUG_SECRET) {
    const providedSecret = req.headers['x-debug-secret']
    if (providedSecret !== DEBUG_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Debug endpoint requires x-debug-secret header'
      })
    }
  }

  try {
    // Extract project ref from URL safely (mask most of it)
    let projectRef = 'unknown'
    let urlValid = false
    if (SUPABASE_URL) {
      const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
      if (match) {
        const ref = match[1]
        projectRef = ref.substring(0, 4) + '***' + ref.substring(ref.length - 4)
        urlValid = true
      }
    }

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!SUPABASE_URL,
        urlValid: urlValid,
        urlLength: SUPABASE_URL.length,
        projectRef: projectRef, // Masked version
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
        keyLength: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 0
      },
      tests: {}
    }

    // Test 1: Check if users table exists and admin user exists
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, role, is_active')
        .eq('email', 'admin@sck.com')
        .single()

      results.tests.usersTable = {
        accessible: !usersError,
        error: usersError ? usersError.message : null,
        errorCode: usersError ? usersError.code : null,
        adminUserExists: !!usersData,
        adminUserActive: usersData?.is_active || false,
        adminUserRole: usersData?.role || null
      }
    } catch (usersException) {
      results.tests.usersTable = {
        accessible: false,
        error: usersException.message,
        adminUserExists: false
      }
    }

    // Test 2: Check if login_user function exists and works
    try {
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
    } catch (rpcException) {
      results.tests.loginUserFunction = {
        exists: false,
        callable: false,
        error: rpcException.message,
        returnsData: false,
        dataLength: 0,
        userFound: false
      }
    }

    // Diagnosis
    results.diagnosis = {
      canConnectToSupabase: !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY && urlValid,
      canAccessUsersTable: results.tests.usersTable?.accessible || false,
      adminUserExists: results.tests.usersTable?.adminUserExists || false,
      loginFunctionExists: results.tests.loginUserFunction?.exists || false,
      loginFunctionWorks: results.tests.loginUserFunction?.callable && results.tests.loginUserFunction?.dataLength > 0,
      overallStatus: null
    }

    // Determine overall status
    if (!urlValid) {
      results.diagnosis.overallStatus = 'ERROR: SUPABASE_URL format is invalid'
    } else if (!results.diagnosis.canAccessUsersTable) {
      results.diagnosis.overallStatus = 'ERROR: Cannot access users table'
    } else if (!results.diagnosis.adminUserExists) {
      results.diagnosis.overallStatus = 'ERROR: admin@sck.com does not exist'
    } else if (!results.diagnosis.loginFunctionExists) {
      results.diagnosis.overallStatus = 'ERROR: login_user function does not exist'
    } else if (!results.diagnosis.loginFunctionWorks) {
      results.diagnosis.overallStatus = 'ERROR: login_user function returns no data'
    } else {
      results.diagnosis.overallStatus = 'SUCCESS: All tests passed'
    }

    return res.status(200).json({
      success: true,
      message: 'Database diagnostic completed',
      results
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Diagnostic test failed',
      error: error.message
    })
  }
}
