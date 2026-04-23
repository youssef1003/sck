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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authorization - Super Admin only
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
      
      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Super Admin access required' })
      }
    }

    // Create backup of all important tables
    const backup = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // Backup users
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    backup.tables.users = users || []

    // Backup admin_permissions
    const { data: permissions } = await supabase
      .from('admin_permissions')
      .select('*')

    backup.tables.admin_permissions = permissions || []

    // Backup contact_requests
    const { data: contacts } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    backup.tables.contact_requests = contacts || []

    // Backup consultation_bookings
    const { data: bookings } = await supabase
      .from('consultation_bookings')
      .select('*')
      .order('created_at', { ascending: false })

    backup.tables.consultation_bookings = bookings || []

    // Backup blog_posts
    const { data: blog } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    backup.tables.blog_posts = blog || []

    // Backup job_applications
    const { data: jobs } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })

    backup.tables.job_applications = jobs || []

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="sck-backup-${new Date().toISOString().split('T')[0]}.json"`)

    return res.status(200).json(backup)

  } catch (error) {
    console.error('Backup error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Backup failed' 
    })
  }
}