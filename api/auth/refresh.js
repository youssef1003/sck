const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refresh token is required' 
      })
    }

    // Verify refresh token
    const decoded = verifyToken(refresh_token)
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      })
    }

    // Get user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', decoded.user_id)
      .is('deleted_at', null)
      .single()

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      })
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated' 
      })
    }

    // Get permissions for sub-admins
    let permissions = []
    if (user.role === 'subadmin') {
      const { data: permData } = await supabase
        .from('admin_permissions')
        .select('permissions')
        .eq('user_id', user.id)
        .single()
      
      if (permData) {
        permissions = permData.permissions || []
      }
    }

    // Create new tokens
    const tokenData = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      permissions: permissions
    }

    const accessToken = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1h' })
    const newRefreshToken = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: '7d' })

    return res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600
      }
    })

  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}