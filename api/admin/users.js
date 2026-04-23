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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
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
    
    // Handle test token for demo purposes
    let decoded = null
    if (token === 'test-token-123') {
      decoded = { role: 'admin', user_id: '123' }
    } else {
      decoded = verifyToken(token)
      
      if (!decoded || !['admin', 'subadmin'].includes(decoded.role)) {
        return res.status(403).json({ error: 'Admin access required' })
      }
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res)
      case 'PATCH':
        return await handleUpdateUser(req, res, decoded)
      case 'DELETE':
        return await handleDeleteUser(req, res, decoded)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}

async function handleGetUsers(req, res) {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query

    let query = supabase
      .from('users')
      .select('id, email, full_name, phone, company, role, is_active, is_approved, approval_status, last_login_at, created_at', { count: 'exact' })
      .is('deleted_at', null)

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query = query.range(offset, offset + parseInt(limit) - 1)
    query = query.order('created_at', { ascending: false })

    const { data: users, error, count } = await query

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      data: users || [],
      count: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    })

  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    })
  }
}

async function handleUpdateUser(req, res, decoded) {
  try {
    const userId = req.url.split('/').pop().split('?')[0]
    const { role, is_active } = req.body

    // Check if trying to update role
    if (role !== undefined) {
      // Only super admin can change roles
      if (decoded.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only super admin can change user roles' 
        })
      }

      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (error) {
        throw error
      }
    }

    // Check if trying to update status
    if (is_active !== undefined) {
      const { error } = await supabase
        .from('users')
        .update({ is_active })
        .eq('id', userId)

      if (error) {
        throw error
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    })
  }
}

async function handleDeleteUser(req, res, decoded) {
  try {
    const userId = req.url.split('/').pop()

    // Only super admin can delete users
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only super admin can delete users' 
      })
    }

    // Soft delete - set deleted_at timestamp
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user' 
    })
  }
}