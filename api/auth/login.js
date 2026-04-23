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
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      })
    }

    // Use Supabase's built-in crypt function for password verification
    const { data: users, error: userError } = await supabase
      .rpc('verify_user_password', {
        user_email: email,
        user_password: password
      })

    if (userError) {
      console.error('Database error:', userError)
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      })
    }

    const user = users[0]

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

    // Create JWT token
    const tokenData = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      permissions: permissions
    }

    const accessToken = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: '7d' })

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
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
          role: user.role,
          is_approved: user.is_approved,
          permissions: permissions
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