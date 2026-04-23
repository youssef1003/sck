import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function handler(req, res) {
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
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refresh token is required' 
      })
    }

    // Verify refresh token
    let decoded
    try {
      decoded = jwt.verify(refresh_token, JWT_SECRET)
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.user_id)
      .is('deleted_at', null)
      .single()

    if (userError || !user) {
      return res.status(401).json({ 
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
        expires_in: 3600,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_approved: user.is_approved,
          permissions: permissions
        }
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