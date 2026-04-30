/**
 * Database Connection Test Endpoint - TEMPORARY DIAGNOSTIC ONLY
 * Tests Supabase connection and login_user function
 * REMOVE THIS FILE AFTER DEBUGGING OR PROTECT WITH SECRET HEADER
 */

const { createClient } = require('@supabase/supabase-js')

// Safely trim and clean environment variables
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '') || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '') || ''

console.log('TEST-DB INIT:', {
  hasUrl: !!SUPABASE_URL,
  urlLength: SUPABASE_URL.length,
  urlStartsWithHttps: SUPABASE_URL.startsWith('https://'),
  urlEndsWithSupabaseCo: SUPABASE_URL.endsWith('.supabase.co'),
  hasKey: !!SUPABASE_SERVICE_KEY,
  keyLength: SUPABASE_SERVICE_KEY.length
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

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

    // Test 0: Direct fetch test to Supabase REST API
    console.log('Test 0: Direct fetch to Supabase REST API...')
    try {
      const directFetchUrl = `${SUPABASE_URL}/rest/v1/`
      console.log('Fetching:', directFetchUrl.substring(0, 50) + '...')
      
      const fetchResponse = await fetch(directFetchUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      })

      results.tests.directFetch = {
        success: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        contentType: fetchResponse.headers.get('content-type')
      }

      console.log('Direct fetch result:', results.tests.directFetch)
    } catch (fetchError) {
      console.error('Direct fetch error:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause?.message || fetchError.cause
      })
      
      results.tests.directFetch = {
        success: false,
        error: fetchError.message,
        errorName: fetchError.name,
        errorCause: fetchError.cause?.message || String(fetchError.cause || '')
      }
    }

    // Test 1: Check if users table exists and admin user exists
    console.log('Test 1: Checking users table and admin user...')
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, role, is_active')
        .eq('email', 'admin@sck.com')
        .single()

      if (usersError) {
        console.error('Users table error:', {
          message: usersError.message,
          code: usersError.code,
          details: usersError.details
        })
      }

      results.tests.usersTable = {
        accessible: !usersError,
        error: usersError ? usersError.message : null,
        errorCode: usersError ? usersError.code : null,
        adminUserExists: !!usersData,
        adminUserActive: usersData?.is_active || false,
        adminUserRole: usersData?.role || null
      }
    } catch (usersException) {
      console.error('Users table exception:', {
        name: usersException.name,
        message: usersException.message,
        cause: usersException.cause
      })
      
      results.tests.usersTable = {
        accessible: false,
        error: usersException.message,
        errorName: usersException.name,
        adminUserExists: false
      }
    }

    // Test 2: Check if login_user function exists and works
    console.log('Test 2: Testing login_user function...')
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('login_user', {
        p_email: 'admin@sck.com',
        p_password: 'scq2025'
      })

      if (rpcError) {
        console.error('RPC error:', {
          message: rpcError.message,
          code: rpcError.code,
          details: rpcError.details
        })
      }

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
      console.error('RPC exception:', {
        name: rpcException.name,
        message: rpcException.message,
        cause: rpcException.cause
      })
      
      results.tests.loginUserFunction = {
        exists: false,
        callable: false,
        error: rpcException.message,
        errorName: rpcException.name,
        returnsData: false,
        dataLength: 0,
        userFound: false
      }
    }

    // Diagnosis
    results.diagnosis = {
      canConnectToSupabase: !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY && urlValid,
      directFetchWorks: results.tests.directFetch?.success || false,
      canAccessUsersTable: results.tests.usersTable?.accessible || false,
      adminUserExists: results.tests.usersTable?.adminUserExists || false,
      loginFunctionExists: results.tests.loginUserFunction?.exists || false,
      loginFunctionWorks: results.tests.loginUserFunction?.callable && results.tests.loginUserFunction?.dataLength > 0,
      overallStatus: null
    }

    // Determine overall status
    if (!urlValid) {
      results.diagnosis.overallStatus = 'ERROR: SUPABASE_URL format is invalid. Must be https://PROJECT_REF.supabase.co'
    } else if (!results.diagnosis.directFetchWorks) {
      results.diagnosis.overallStatus = 'ERROR: Cannot connect to Supabase. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel. Verify project is not paused.'
    } else if (!results.diagnosis.canAccessUsersTable) {
      results.diagnosis.overallStatus = 'ERROR: Cannot access users table. Check Supabase service key permissions or verify correct project.'
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
    console.error('Test endpoint error:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.split('\n')[0]
    })
    
    return res.status(500).json({
      success: false,
      message: 'Diagnostic test failed',
      error: error.message,
      errorName: error.name
    })
  }
}
