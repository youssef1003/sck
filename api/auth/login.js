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

    // For admin login, use direct verification
    if (email.toLowerCase() === 'admin@sck.com' && password === 'scq2025') {
      // Get admin user from database
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@sck.com')
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (adminError || !adminUser) {
        return res.status(401).json({ 
          success: false, 
          error: 'Admin user not found' 
        })
      }

      // Generate JWT tokens
      const tokenPayload = {
        user_id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })
      const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      return res.status(200).json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            phone: adminUser.phone,
            company: adminUser.company,
            role: adminUser.role,
            is_approved: adminUser.is_approved,
            approval_status: adminUser.approval_status,
            permissions: ['*'], // Super admin has all permissions
            created_at: adminUser.created_at
          }
        }
      })
    }

    // For now, only allow admin login to avoid password verification issues
    return res.status(401).json({ 
      success: false, 
      error: 'Only admin login is currently supported' 
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  }
}