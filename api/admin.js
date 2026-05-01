const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')
const JWT_SECRET = process.env.JWT_SECRET?.trim().replace(/^["']|["']$/g, '')

// Validate critical environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
  console.error('CRITICAL: Missing required environment variables for admin API')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================================
// Authentication & Authorization Helpers
// ============================================================

// Verify and decode JWT token
function verifyAuth(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.verify(token, JWT_SECRET)
  
  return decoded
}

// Check if user has required permission
async function hasPermission(userId, permission) {
  // Get user with permissions
  const { data: user, error } = await supabase
    .from('users')
    .select('role, permissions')
    .eq('id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  if (error || !user) {
    return false
  }

  // Super admin has all permissions
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true
  }

  // Check subadmin permissions
  if (user.role === 'subadmin') {
    const permissions = user.permissions || []
    return permissions.includes(permission)
  }

  return false
}

// Require admin or specific permission
async function requireAdminOrPermission(req, permission = null) {
  const decoded = verifyAuth(req)
  
  // Super admin always allowed
  if (decoded.role === 'admin' || decoded.role === 'super_admin') {
    return decoded
  }

  // If no specific permission required, just check if subadmin
  if (!permission) {
    if (decoded.role === 'subadmin') {
      return decoded
    }
    throw new Error('Not authorized')
  }

  // Check specific permission
  const allowed = await hasPermission(decoded.userId, permission)
  if (!allowed) {
    throw new Error('Insufficient permissions')
  }

  return decoded
}

// ============================================================
// Main Handler
// ============================================================

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Verify authentication
    const admin = await requireAdminOrPermission(req)

    // Route based on query parameter
    const { action } = req.query

    switch (action) {
      case 'stats':
        return await handleStats(req, res, admin)
      case 'users':
        return await handleUsers(req, res, admin)
      case 'backup':
        return await handleBackup(req, res, admin)
      case 'blog':
        return await handleBlog(req, res, admin)
      case 'page-content':
        return await handlePageContent(req, res, admin)
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Admin error:', error.message)
    const status = error.message.includes('authorized') || error.message.includes('permission') ? 403 : 500
    return res.status(status).json({
      error: error.message || 'Internal server error'
    })
  }
}

// ============================================================
// Stats Handler
// ============================================================

async function handleStats(req, res, admin) {
  // Check permission
  if (admin.role === 'subadmin') {
    const canView = await hasPermission(admin.userId, 'analytics_view')
    if (!canView) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  }

  try {
    // Get counts with proper error handling
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: bookingsCount } = await supabase
      .from('consultation_bookings')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: contactsCount } = await supabase
      .from('contact_requests')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: blogCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Get pending counts
    const { count: pendingBookings } = await supabase
      .from('consultation_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null)

    const { count: newContacts } = await supabase
      .from('contact_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')
      .is('deleted_at', null)

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: usersCount || 0,
        totalBookings: bookingsCount || 0,
        totalContacts: contactsCount || 0,
        totalBlogPosts: blogCount || 0,
        blog_posts: blogCount || 0,
        pendingBookings: pendingBookings || 0,
        newContacts: newContacts || 0,
        new_messages: newContacts || 0,
        bookings: bookingsCount || 0,
        contacts: contactsCount || 0
      }
    })
  } catch (error) {
    console.error('Stats error:', error.message)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    })
  }
}

// ============================================================
// Users Handler
// ============================================================

async function handleUsers(req, res, admin) {
  // Check permissions
  if (req.method === 'GET') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'users_view'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'POST') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'users_create'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'PUT') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'users_edit'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  } else if (req.method === 'DELETE') {
    if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'users_delete'))) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.status(200).json({ success: true, users: data })
  }

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('users')
      .insert(req.body)
      .select()

    if (error) throw error
    return res.status(200).json({ success: true, user: data[0] })
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return res.status(200).json({ success: true, user: data[0] })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return res.status(200).json({ success: true })
  }
}

// ============================================================
// Backup Handler - Super Admin Only
// ============================================================

async function handleBackup(req, res, admin) {
  // Only super admin can backup
  if (admin.role !== 'admin' && admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin only' })
  }

  const { data: users } = await supabase.from('users').select('*')
  const { data: bookings } = await supabase.from('consultation_bookings').select('*')
  const { data: contacts } = await supabase.from('contact_requests').select('*')

  return res.status(200).json({
    success: true,
    backup: {
      users,
      bookings,
      contacts,
      timestamp: new Date().toISOString()
    }
  })
}

// ============================================================
// Blog Handler
// ============================================================

async function handleBlog(req, res, admin) {
  try {
    // Check permissions
    if (req.method === 'GET') {
      if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'blog_view'))) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    } else if (req.method === 'POST') {
      if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'blog_create'))) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    } else if (req.method === 'PUT') {
      if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'blog_edit'))) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    } else if (req.method === 'PATCH') {
      if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'blog_publish'))) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    } else if (req.method === 'DELETE') {
      if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'blog_delete'))) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    }

    // GET - List blog posts
    if (req.method === 'GET') {
      const { search, limit = 50, offset = 0 } = req.query
      
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,content.ilike.%${search}%`)
      }

      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

      const { data, error, count } = await query

      if (error) throw error

      return res.status(200).json({
        success: true,
        data: data || [],
        count: count || 0
      })
    }

    // POST - Create new blog post
    if (req.method === 'POST') {
      const { title, excerpt, content, author, category, image_url, booking_link, button_text } = req.body

      if (!title || !excerpt || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, excerpt, content'
        })
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          excerpt,
          content,
          author: author || 'فريق SCQ',
          category: category || 'استراتيجية',
          image_url: image_url || null,
          booking_link: booking_link || '/consultation',
          button_text: button_text || 'احجز استشارة',
          is_published: true
        })
        .select()

      if (error) throw error

      return res.status(200).json({
        success: true,
        data: data[0]
      })
    }

    // PUT - Update blog post
    if (req.method === 'PUT') {
      const { id, title, excerpt, content, author, category, image_url, booking_link, button_text } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing post ID'
        })
      }

      const updates = {}
      if (title !== undefined) updates.title = title
      if (excerpt !== undefined) updates.excerpt = excerpt
      if (content !== undefined) updates.content = content
      if (author !== undefined) updates.author = author
      if (category !== undefined) updates.category = category
      if (image_url !== undefined) updates.image_url = image_url
      if (booking_link !== undefined) updates.booking_link = booking_link
      if (button_text !== undefined) updates.button_text = button_text
      updates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: data[0]
      })
    }

    // PATCH - Toggle publish status
    if (req.method === 'PATCH') {
      const { id, is_published } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing post ID'
        })
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: data[0]
      })
    }

    // DELETE - Soft delete blog post
    if (req.method === 'DELETE') {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing post ID'
        })
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
          deleted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: data[0]
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Blog handler error:', error.message)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// ============================================================
// Page Content Handler
// ============================================================

async function handlePageContent(req, res, admin) {
  // Check permissions
  if (admin.role === 'subadmin' && !(await hasPermission(admin.userId, 'home_edit'))) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  try {
    const { page_key } = req.query

    // GET - Get page content
    if (req.method === 'GET') {
      if (!page_key) {
        return res.status(400).json({
          success: false,
          error: 'Missing page_key parameter'
        })
      }

      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', page_key)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return res.status(200).json({
        success: true,
        data: data || null
      })
    }

    // POST/PUT - Save page content
    if (req.method === 'POST' || req.method === 'PUT') {
      const { page_key: bodyPageKey, content } = req.body

      const pageKey = bodyPageKey || page_key

      if (!pageKey || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing page_key or content'
        })
      }

      // Check if page exists
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_key', pageKey)
        .single()

      let result

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('page_content')
          .update({
            content,
            updated_at: new Date().toISOString()
          })
          .eq('page_key', pageKey)
          .select()

        if (error) throw error
        result = data[0]
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('page_content')
          .insert({
            page_key: pageKey,
            content
          })
          .select()

        if (error) throw error
        result = data[0]
      }

      return res.status(200).json({
        success: true,
        data: result
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Page content handler error:', error.message)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
