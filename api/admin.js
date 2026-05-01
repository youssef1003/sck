const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'

// Verify admin token
function verifyAdmin(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.verify(token, JWT_SECRET)
  
  if (decoded.role !== 'admin') {
    throw new Error('Not authorized')
  }
  
  return decoded
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Verify admin
    const admin = verifyAdmin(req)

    // Route based on query parameter
    const { action } = req.query

    switch (action) {
      case 'stats':
        return await handleStats(req, res)
      case 'users':
        return await handleUsers(req, res)
      case 'backup':
        return await handleBackup(req, res)
      case 'manage':
        return await handleManage(req, res)
      case 'blog':
        return await handleBlog(req, res)
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Admin error:', error)
    return res.status(error.message === 'Not authorized' ? 403 : 500).json({
      error: error.message || 'Internal server error'
    })
  }
}

// Stats handler
async function handleStats(req, res) {
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
    console.error('Stats error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stats'
    })
  }
}

// Users handler
async function handleUsers(req, res) {
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

// Backup handler
async function handleBackup(req, res) {
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

// Manage handler
async function handleManage(req, res) {
  const { table, operation, data } = req.body

  if (operation === 'select') {
    const { data: result, error } = await supabase.from(table).select('*')
    if (error) throw error
    return res.status(200).json({ success: true, data: result })
  }

  if (operation === 'insert') {
    const { data: result, error } = await supabase.from(table).insert(data).select()
    if (error) throw error
    return res.status(200).json({ success: true, data: result })
  }

  if (operation === 'update') {
    const { id, ...updates } = data
    const { data: result, error } = await supabase.from(table).update(updates).eq('id', id).select()
    if (error) throw error
    return res.status(200).json({ success: true, data: result })
  }

  if (operation === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', data.id)
    if (error) throw error
    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: 'Invalid operation' })
}

// Blog handler
async function handleBlog(req, res) {
  try {
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
      const { title, excerpt, content, author, category, image_url, booking_link } = req.body

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
          author: author || 'فريق SCK',
          category: category || 'استراتيجية',
          image_url: image_url || null,
          booking_link: booking_link || '/consultation',
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
      const { id, title, excerpt, content, author, category, image_url, booking_link } = req.body

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
    console.error('Blog handler error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}
