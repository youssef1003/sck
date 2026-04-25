const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters'

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    if (userError || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Verify password using Supabase crypt function
    const { data: passwordCheck, error: passwordError } = await supabase
      .rpc('verify_password', {
        input_password: password,
        stored_hash: user.password_hash
      })

    if (passwordError || !passwordCheck) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    // Get user permissions if sub-admin
    let permissions = []
    if (user.role === 'subadmin') {
      const { data: adminPermissions } = await supabase
        .from('admin_permissions')
        .select('permissions')
        .eq('user_id', user.id)
        .single()
      
      permissions = adminPermissions?.permissions || []
    } else if (user.role === 'admin') {
      permissions = ['*'] // Super admin has all permissions
    }

    // Generate JWT tokens
    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role
    }

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          company: user.company,
          role: user.role,
          is_approved: user.is_approved,
          approval_status: user.approval_status,
          permissions: permissions,
          created_at: user.created_at
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  }
}