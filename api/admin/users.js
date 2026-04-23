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

function checkPermission(user, permission) {
  if (user.role === 'admin') return true
  if (user.role === 'subadmin') {
    return user.permissions && user.permissions.includes(permission)
  }
  return false
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Check authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || !['admin', 'subadmin'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (req.method === 'GET') {
      // Check permission
      if (!checkPermission(decoded, 'users_view')) {
        return res.status(403).json({ error: 'Permission denied' })
      }

      const { search, role, limit = 50, offset = 0 } = req.query

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      // Filter by deleted_at if column exists
      try {
        query = query.is('deleted_at', null)
      } catch (error) {
        // Column might not exist, continue
      }

      if (role && role !== 'all') {
        query = query.eq('role', role)
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

      if (error) {
        throw error
      }

      return res.status(200).json({
        success: true,
        data: data || [],
        count: count || 0
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}