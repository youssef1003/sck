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
    // Check authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    
    // Handle test token for demo purposes
    if (token === 'test-token-123') {
      // Continue with admin access
    } else {
      const decoded = verifyToken(token)
      
      if (!decoded || !['admin', 'subadmin'].includes(decoded.role)) {
        return res.status(403).json({ error: 'Admin access required' })
      }
    }

    // Initialize stats with defaults
    const stats = {
      users: 0,
      bookings: 0,
      contacts: 0,
      blog_posts: 0,
      pending_bookings: 0,
      new_messages: 0,
    }

    // Get users count
    try {
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
      
      stats.users = usersCount || 0
    } catch (error) {
      console.log('Users table query failed:', error.message)
    }

    // Get bookings count
    try {
      const { count: bookingsCount } = await supabase
        .from('consultation_bookings')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
      
      stats.bookings = bookingsCount || 0

      // Get pending bookings
      const { count: pendingCount } = await supabase
        .from('consultation_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .is('deleted_at', null)
      
      stats.pending_bookings = pendingCount || 0
    } catch (error) {
      console.log('Bookings table query failed:', error.message)
    }

    // Get contacts count
    try {
      const { count: contactsCount } = await supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
      
      stats.contacts = contactsCount || 0

      // Get new messages
      const { count: newCount } = await supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .is('deleted_at', null)
      
      stats.new_messages = newCount || 0
    } catch (error) {
      console.log('Contacts table query failed:', error.message)
    }

    // Get blog posts count
    try {
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
      
      stats.blog_posts = blogCount || 0
    } catch (error) {
      console.log('Blog posts table query failed:', error.message)
    }

    return res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Stats error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}