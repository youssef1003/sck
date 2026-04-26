const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'

// Initialize Supabase client
let supabase = null
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
  }
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
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
    
    if (!decoded || !['admin', 'subadmin'].includes(decoded.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      })
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGetMessages(req, res)
      case 'PATCH':
        return await handleUpdateMessage(req, res, decoded)
      case 'DELETE':
        return await handleDeleteMessage(req, res, decoded)
      default:
        return res.status(405).json({ 
          success: false,
          error: 'Method not allowed' 
        })
    }

  } catch (error) {
    console.error('Messages API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    })
  }
}

async function handleGetMessages(req, res) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        message: 'Database not configured'
      })
    }

    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      status = '' 
    } = req.query

    let query = supabase
      .from('contact_requests')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query = query.range(offset, offset + parseInt(limit) - 1)
    query = query.order('created_at', { ascending: false })

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0
      })
    }

    return res.status(200).json({
      success: true,
      data: messages || [],
      count: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return res.status(200).json({
      success: true,
      data: [],
      count: 0,
      page: 1,
      limit: 50,
      totalPages: 0
    })
  }
}

async function handleUpdateMessage(req, res, decoded) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    // Extract message ID from URL
    const urlParts = req.url.split('/')
    const messageId = urlParts[urlParts.length - 2] // /api/admin/messages/:id/status

    const { status } = req.query

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      })
    }

    // Validate status
    const validStatuses = ['new', 'pending', 'resolved', 'rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const { error } = await supabase
      .from('contact_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'Message status updated successfully'
    })

  } catch (error) {
    console.error('Update message error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update message',
      details: error.message
    })
  }
}

async function handleDeleteMessage(req, res, decoded) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    // Only super admin can delete messages
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only super admin can delete messages' 
      })
    }

    // Extract message ID from URL
    const urlParts = req.url.split('/')
    const messageId = urlParts[urlParts.length - 1]

    // Soft delete - set deleted_at timestamp
    const { error } = await supabase
      .from('contact_requests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Delete message error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete message',
      details: error.message
    })
  }
}
