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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
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

    // Parse URL to determine which resource to handle
    const url = req.url || ''
    
    // Route to appropriate handler
    if (url.includes('/bookings')) {
      return await handleBookings(req, res, decoded)
    } else if (url.includes('/messages')) {
      return await handleMessages(req, res, decoded)
    } else if (url.includes('/content')) {
      return await handleContent(req, res, decoded)
    } else {
      return res.status(404).json({ 
        success: false,
        error: 'Resource not found' 
      })
    }

  } catch (error) {
    console.error('Admin Manage API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    })
  }
}

// ============================================================================
// BOOKINGS HANDLERS
// ============================================================================

async function handleBookings(req, res, decoded) {
  switch (req.method) {
    case 'GET':
      return await getBookings(req, res)
    case 'PATCH':
      return await updateBooking(req, res, decoded)
    case 'DELETE':
      return await deleteBooking(req, res, decoded)
    default:
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      })
  }
}

async function getBookings(req, res) {
  try {
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
      .from('consultation_bookings')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)
    query = query.range(offset, offset + parseInt(limit) - 1)
    query = query.order('created_at', { ascending: false })

    const { data: bookings, error, count } = await query

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
      data: bookings || [],
      count: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    })

  } catch (error) {
    console.error('Get bookings error:', error)
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

async function updateBooking(req, res, decoded) {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    const urlParts = req.url.split('/')
    const bookingId = urlParts[urlParts.length - 2]
    const { status } = req.query

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      })
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const { error } = await supabase
      .from('consultation_bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully'
    })

  } catch (error) {
    console.error('Update booking error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update booking',
      details: error.message
    })
  }
}

async function deleteBooking(req, res, decoded) {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only super admin can delete bookings' 
      })
    }

    const urlParts = req.url.split('/')
    const bookingId = urlParts[urlParts.length - 1]

    const { error } = await supabase
      .from('consultation_bookings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Delete booking error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete booking',
      details: error.message
    })
  }
}

// ============================================================================
// MESSAGES HANDLERS
// ============================================================================

async function handleMessages(req, res, decoded) {
  switch (req.method) {
    case 'GET':
      return await getMessages(req, res)
    case 'PATCH':
      return await updateMessage(req, res, decoded)
    case 'DELETE':
      return await deleteMessage(req, res, decoded)
    default:
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      })
  }
}

async function getMessages(req, res) {
  try {
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

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

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

async function updateMessage(req, res, decoded) {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    const urlParts = req.url.split('/')
    const messageId = urlParts[urlParts.length - 2]
    const { status } = req.query

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      })
    }

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

async function deleteMessage(req, res, decoded) {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only super admin can delete messages' 
      })
    }

    const urlParts = req.url.split('/')
    const messageId = urlParts[urlParts.length - 1]

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

// ============================================================================
// CONTENT HANDLERS
// ============================================================================

async function handleContent(req, res, decoded) {
  switch (req.method) {
    case 'GET':
      return await getContent(req, res)
    case 'POST':
      return await saveContent(req, res, decoded)
    default:
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      })
  }
}

async function getContent(req, res) {
  try {
    if (!supabase) {
      return res.status(200).json({
        success: true,
        data: {},
        message: 'Database not configured - using localStorage'
      })
    }

    const urlParts = req.url.split('/')
    const pageKey = urlParts[urlParts.length - 1].split('?')[0]

    const validPages = ['home', 'services', 'about', 'contact']
    if (!validPages.includes(pageKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page key'
      })
    }

    const { data, error } = await supabase
      .from('page_content')
      .select('content')
      .eq('page_key', pageKey)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          success: true,
          data: {}
        })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      data: data?.content || {}
    })

  } catch (error) {
    console.error('Get content error:', error)
    return res.status(200).json({
      success: true,
      data: {}
    })
  }
}

async function saveContent(req, res, decoded) {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    const urlParts = req.url.split('/')
    const pageKey = urlParts[urlParts.length - 1].split('?')[0]

    const validPages = ['home', 'services', 'about', 'contact']
    if (!validPages.includes(pageKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page key'
      })
    }

    const { content } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      })
    }

    const { error } = await supabase
      .from('page_content')
      .upsert({
        page_key: pageKey,
        content: content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'page_key'
      })

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'Content saved successfully'
    })

  } catch (error) {
    console.error('Save content error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to save content',
      details: error.message
    })
  }
}
