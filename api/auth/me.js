import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      })
    }

    // Get user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, company, role, is_active, is_approved, approval_status, last_login_at, metadata, created_at, updated_at')
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

    return res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          permissions: permissions
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}