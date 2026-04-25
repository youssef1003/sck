const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

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

    // Initialize Supabase client
    let stats = {
      users: 0,
      bookings: 0,
      contacts: 0,
      blog_posts: 0,
      new_messages: 0,
      pending_bookings: 0,
      employers: 0,
      pending_employers: 0,
      subadmins: 0,
      job_applications: 0
    }

    // If Supabase is configured, fetch real data
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        // Fetch all stats in parallel
        const [
          usersResult,
          bookingsResult,
          contactsResult,
          blogPostsResult,
          newMessagesResult,
          pendingBookingsResult,
          employersResult,
          pendingEmployersResult,
          subadminsResult,
          jobApplicationsResult
        ] = await Promise.all([
          // Total users (excluding deleted)
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null),
          
          // Total bookings (excluding deleted)
          supabase
            .from('consultation_bookings')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null),
          
          // Total contacts (excluding deleted)
          supabase
            .from('contact_requests')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null),
          
          // Total blog posts (excluding deleted)
          supabase
            .from('blog_posts')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null),
          
          // New messages (status = 'new')
          supabase
            .from('contact_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'new')
            .is('deleted_at', null),
          
          // Pending bookings (status = 'pending')
          supabase
            .from('consultation_bookings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')
            .is('deleted_at', null),
          
          // Employers (role = 'employer')
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'employer')
            .is('deleted_at', null),
          
          // Pending employers (approval_status = 'pending')
          supabase
            .from('employer_approvals')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
          
          // Subadmins (role = 'subadmin')
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'subadmin')
            .is('deleted_at', null),
          
          // Job applications (excluding deleted)
          supabase
            .from('job_applications')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null)
        ])

        // Update stats with real data (use 0 if null or error)
        stats = {
          users: usersResult.count || 0,
          bookings: bookingsResult.count || 0,
          contacts: contactsResult.count || 0,
          blog_posts: blogPostsResult.count || 0,
          new_messages: newMessagesResult.count || 0,
          pending_bookings: pendingBookingsResult.count || 0,
          employers: employersResult.count || 0,
          pending_employers: pendingEmployersResult.count || 0,
          subadmins: subadminsResult.count || 0,
          job_applications: jobApplicationsResult.count || 0
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Return zeros if database query fails
      }
    }

    return res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats: ' + error.message
    })
  }
}
