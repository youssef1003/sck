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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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
        return await handleGetContent(req, res)
      case 'POST':
        return await handleSaveContent(req, res, decoded)
      default:
        return res.status(405).json({ 
          success: false,
          error: 'Method not allowed' 
        })
    }

  } catch (error) {
    console.error('Content API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    })
  }
}

async function handleGetContent(req, res) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(200).json({
        success: true,
        data: {},
        message: 'Database not configured - using localStorage'
      })
    }

    // Extract page key from URL
    const urlParts = req.url.split('/')
    const pageKey = urlParts[urlParts.length - 1].split('?')[0]

    // Validate page key
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
      // If page doesn't exist, return empty content
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

async function handleSaveContent(req, res, decoded) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      })
    }

    // Extract page key from URL
    const urlParts = req.url.split('/')
    const pageKey = urlParts[urlParts.length - 1].split('?')[0]

    // Validate page key
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

    // Upsert content (insert or update)
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
