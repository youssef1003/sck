const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true })
  }

  const { action } = req.query

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

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required' 
    })
  }

  try {
    // Call login_user function from database
    const { data: result, error } = await supabase.rpc('login_user', {
      p_email: email,
      p_password: password
    })

    if (error) {
      console.error('Login RPC error:', error)
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password'
      })
    }

    if (!result || result.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    const user = result[0]

    // Check if user is active
    if (!user.is_active) {
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

    return res.status(200).json({
      success: true,
      token: access_token, // For backward compatibility
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          company: user.company
        }
      }
    })
  } catch (error) {
    console.error('Login exception:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error. Please try again later.' 
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
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          company: user.company,
          role: user.role,
          created_at: user.created_at
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
