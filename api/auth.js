const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase with error checking and safe trimming
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '') || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '') || ''
const JWT_SECRET = process.env.JWT_SECRET?.trim().replace(/^["']|["']$/g, '') || 'sck_super_secret_key_2025_production'

console.log('AUTH INIT:', {
  hasUrl: !!SUPABASE_URL,
  urlValid: SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co'),
  urlLength: SUPABASE_URL.length,
  hasKey: !!SUPABASE_SERVICE_KEY,
  keyLength: SUPABASE_SERVICE_KEY.length,
  hasJwtSecret: !!JWT_SECRET
})

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('CRITICAL: Missing Supabase credentials:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_SERVICE_KEY
  })
}

if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
  console.error('CRITICAL: Invalid SUPABASE_URL format:', {
    url: SUPABASE_URL.substring(0, 30) + '...',
    startsWithHttps: SUPABASE_URL.startsWith('https://'),
    includesSupabase: SUPABASE_URL.includes('.supabase.co')
  })
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true })
  }

  // Normalize action - remove any spaces, backslashes, or special characters
  const rawAction = req.query.action || ''
  const action = String(rawAction).trim().replace(/[\\/\s]/g, '').toLowerCase()

  console.log('Auth request:', {
    method: req.method,
    rawAction,
    normalizedAction: action,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : []
  })

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res)
      case 'me':
        return await handleMe(req, res)
      case 'refresh':
        return await handleRefresh(req, res)
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid action. Use: login, me, or refresh' 
        })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Internal server error' 
    })
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    })
  }

  // Support both email and username fields (as Arabic UI says "البريد الإلكتروني أو اسم المستخدم")
  const identifier = req.body.email || req.body.username || req.body.identifier
  const password = req.body.password

  console.log('=== LOGIN DEBUG START ===')
  console.log('AUTH DEBUG:', {
    method: req.method,
    rawAction: req.query.action,
    normalizedAction: req.query.action ? String(req.query.action).trim().replace(/[\\/\s]/g, '').toLowerCase() : '',
    bodyKeys: Object.keys(req.body || {}),
    hasIdentifier: !!identifier,
    identifierValue: identifier,
    hasPassword: !!password,
    passwordLength: password ? password.length : 0
  })

  if (!identifier || !password) {
    console.log('ERROR: Missing credentials')
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required' 
    })
  }

  try {
    // Call login_user function from database
    // This function uses crypt() to verify password against password_hash
    console.log('Calling Supabase RPC login_user with:', {
      p_email: identifier,
      passwordProvided: true
    })
    
    const { data: result, error } = await supabase.rpc('login_user', {
      p_email: identifier,
      p_password: password
    })

    console.log('SUPABASE RPC DEBUG:', {
      rpcName: 'login_user',
      hasData: !!result,
      isArray: Array.isArray(result),
      dataLength: Array.isArray(result) ? result.length : (result ? 1 : 0),
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint,
      resultType: typeof result,
      resultKeys: result ? Object.keys(result) : []
    })

    if (error) {
      console.error('Login RPC error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password',
        debug: process.env.NODE_ENV !== 'production' ? {
          error: error.message,
          code: error.code
        } : undefined
      })
    }

    // Handle both array and single object responses
    let user = null
    if (Array.isArray(result)) {
      console.log('Result is array with length:', result.length)
      if (result.length === 0) {
        console.log('ERROR: No user found - empty array')
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        })
      }
      user = result[0]
    } else if (result && typeof result === 'object') {
      console.log('Result is object')
      user = result
    } else {
      console.log('ERROR: No user found - invalid result type:', typeof result)
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    })

    // Check if user is active
    if (!user.is_active) {
      console.log('ERROR: User is inactive')
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive. Please contact support.' 
      })
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Generate JWT tokens
    const access_token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const refresh_token = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    console.log('Login successful for:', user.email, 'role:', user.role)
    console.log('=== LOGIN DEBUG END ===')

    // Return FULLY backward compatible response with ALL possible token/user locations
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: access_token, // For backward compatibility
      access_token: access_token, // Also at root level
      refresh_token: refresh_token, // Also at root level
      user: {  // Also at root level
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        company: user.company,
        is_active: user.is_active
      },
      data: {
        access_token,
        refresh_token,
        token: access_token, // Also in data
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          company: user.company,
          is_active: user.is_active
        }
      }
    })
  } catch (error) {
    console.error('Login exception:', error)
    console.log('=== LOGIN DEBUG END (ERROR) ===')
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error. Please try again later.',
      debug: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
}

async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'No authorization header' 
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, company, role, is_active, created_at')
      .eq('id', decoded.userId)
      .is('deleted_at', null)
      .single()

    if (error || !user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      })
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        error: 'Account is inactive' 
      })
    }

    return res.status(200).json({
      success: true,
      user: {  // Also at root level for compatibility
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        company: user.company,
        role: user.role,
        created_at: user.created_at,
        is_active: user.is_active
      },
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          company: user.company,
          role: user.role,
          created_at: user.created_at,
          is_active: user.is_active
        }
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token' 
    })
  }
}

async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }

  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({ 
      success: false,
      error: 'Refresh token required' 
    })
  }

  try {
    const decoded = jwt.verify(refresh_token, JWT_SECRET)
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid refresh token' 
      })
    }

    // Get user to verify still active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', decoded.userId)
      .is('deleted_at', null)
      .single()

    if (error || !user || !user.is_active) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found or inactive' 
      })
    }
    
    // Generate new tokens
    const access_token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const new_refresh_token = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(200).json({
      success: true,
      data: {
        access_token,
        refresh_token: new_refresh_token
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired refresh token' 
    })
  }
}
