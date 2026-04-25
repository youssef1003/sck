const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters'

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Check if user is admin
const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'subadmin')
}

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-') // Remove leading/trailing hyphens
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
    // Verify authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
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

    // Get current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.user_id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    if (userError || !currentUser) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      })
    }

    if (!isAdmin(currentUser)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      })
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, currentUser)
      case 'POST':
        return await handlePost(req, res, currentUser)
      case 'PUT':
        return await handlePut(req, res, currentUser)
      case 'DELETE':
        return await handleDelete(req, res, currentUser)
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        })
    }

  } catch (error) {
    console.error('Blog API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// GET - List all blog posts
async function handleGet(req, res, currentUser) {
  try {
    const { page = 1, limit = 20, category, published } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by published status if provided
    if (published !== undefined) {
      query = query.eq('is_published', published === 'true')
    }

    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get total count
    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    return res.status(200).json({
      success: true,
      data: posts,
      count: posts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    })

  } catch (error) {
    console.error('Get Blog Posts Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts',
      details: error.message
    })
  }
}

// POST - Create new blog post
async function handlePost(req, res, currentUser) {
  try {
    const { 
      title, 
      excerpt, 
      content, 
      category, 
      imageUrl, 
      isPublished = true 
    } = req.body

    // Validation
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, excerpt, content, and category are required'
      })
    }

    // Generate slug
    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    let finalSlug = slug
    if (existingPost) {
      // Add timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`
    }

    // Create blog post
    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: currentUser.full_name,
        author_id: currentUser.id,
        category: category.trim(),
        image_url: imageUrl || null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newPost
    })

  } catch (error) {
    console.error('Create Blog Post Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create blog post',
      details: error.message
    })
  }
}

// PUT - Update blog post
async function handlePut(req, res, currentUser) {
  try {
    const { id } = req.query
    const { 
      title, 
      excerpt, 
      content, 
      category, 
      imageUrl, 
      isPublished 
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Blog post ID is required'
      })
    }

    // Check if blog post exists
    const { data: existingPost, error: checkError } = await supabase
      .from('blog_posts')
      .select('id, slug, is_published')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      })
    }

    // Prepare update data
    const updateData = {}
    
    if (title !== undefined) {
      updateData.title = title.trim()
      // Regenerate slug if title changed
      const newSlug = generateSlug(title)
      if (newSlug !== existingPost.slug) {
        // Check if new slug exists
        const { data: slugExists } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .is('deleted_at', null)
          .single()

        updateData.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug
      }
    }
    
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (category !== undefined) updateData.category = category.trim()
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    
    if (isPublished !== undefined) {
      updateData.is_published = isPublished
      // Set published_at when publishing for the first time
      if (isPublished && !existingPost.is_published) {
        updateData.published_at = new Date().toISOString()
      }
    }

    // Update blog post
    const { data: updatedPost, error: updateError } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedPost
    })

  } catch (error) {
    console.error('Update Blog Post Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update blog post',
      details: error.message
    })
  }
}

// DELETE - Delete blog post (soft delete)
async function handleDelete(req, res, currentUser) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Blog post ID is required'
      })
    }

    // Check if blog post exists
    const { data: existingPost, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      })
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_published: false 
      })
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    })

  } catch (error) {
    console.error('Delete Blog Post Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete blog post',
      details: error.message
    })
  }
}