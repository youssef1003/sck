const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'

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

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Get the resource type from query parameter
    const { resource } = req.query
    
    if (!resource) {
      return res.status(400).json({
        success: false,
        error: 'Resource parameter is required (subadmins, employers, blog)'
      })
    }

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

    // Route to appropriate handler based on resource
    switch (resource) {
      case 'subadmins':
        return await handleSubAdmins(req, res, currentUser)
      case 'employers':
        return await handleEmployers(req, res, currentUser)
      case 'blog':
        return await handleBlog(req, res, currentUser)
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid resource. Supported: subadmins, employers, blog'
        })
    }

  } catch (error) {
    console.error('Management API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// ============================================================================
// SUB-ADMINS MANAGEMENT
// ============================================================================

async function handleSubAdmins(req, res, currentUser) {
  switch (req.method) {
    case 'GET':
      return await getSubAdmins(req, res)
    case 'POST':
      return await createSubAdmin(req, res, currentUser)
    case 'PUT':
      return await updateSubAdmin(req, res)
    case 'DELETE':
      return await deleteSubAdmin(req, res)
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

async function getSubAdmins(req, res) {
  try {
    const { data: subAdmins, error } = await supabase
      .from('users')
      .select(`
        id, email, full_name, phone, company, role, is_active, created_at, updated_at,
        admin_permissions (permissions)
      `)
      .eq('role', 'subadmin')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedSubAdmins = subAdmins.map(admin => ({
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      phone: admin.phone,
      company: admin.company,
      role: admin.role,
      isActive: admin.is_active,
      permissions: admin.admin_permissions?.[0]?.permissions || [],
      createdAt: admin.created_at,
      updatedAt: admin.updated_at
    }))

    return res.status(200).json({
      success: true,
      data: formattedSubAdmins,
      count: formattedSubAdmins.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch sub-admins',
      details: error.message
    })
  }
}

async function createSubAdmin(req, res, currentUser) {
  try {
    const { email, fullName, phone, company, permissions = [] } = req.body

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email and full name are required'
      })
    }

    // Check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      })
    }

    // Generate temp password
    const tempPassword = 'temp' + Math.random().toString(36).substring(2, 15)

    // Create user
    const { data: newUser, error: userError } = await supabase.rpc('create_subadmin_user', {
      p_email: email,
      p_password: tempPassword,
      p_full_name: fullName,
      p_phone: phone || null,
      p_company: company || null
    })

    if (userError) throw userError

    // Get created user
    const { data: createdUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    // Create permissions
    await supabase
      .from('admin_permissions')
      .insert({
        user_id: createdUser.id,
        permissions: permissions
      })

    return res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      data: { id: createdUser.id, email, fullName, tempPassword }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create sub-admin',
      details: error.message
    })
  }
}

async function updateSubAdmin(req, res) {
  try {
    const { id } = req.query
    const { fullName, phone, company, permissions, isActive } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Sub-admin ID is required'
      })
    }

    // Update user info
    const updateData = {}
    if (fullName !== undefined) updateData.full_name = fullName
    if (phone !== undefined) updateData.phone = phone
    if (company !== undefined) updateData.company = company
    if (isActive !== undefined) updateData.is_active = isActive

    if (Object.keys(updateData).length > 0) {
      await supabase.from('users').update(updateData).eq('id', id)
    }

    // Update permissions
    if (permissions !== undefined) {
      await supabase
        .from('admin_permissions')
        .upsert({ user_id: id, permissions })
    }

    return res.status(200).json({
      success: true,
      message: 'Sub-admin updated successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update sub-admin',
      details: error.message
    })
  }
}

async function deleteSubAdmin(req, res) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Sub-admin ID is required'
      })
    }

    await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id)

    return res.status(200).json({
      success: true,
      message: 'Sub-admin deleted successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete sub-admin',
      details: error.message
    })
  }
}

// ============================================================================
// EMPLOYERS MANAGEMENT
// ============================================================================

async function handleEmployers(req, res, currentUser) {
  switch (req.method) {
    case 'GET':
      return await getEmployers(req, res)
    case 'POST':
      return await handleEmployerAction(req, res, currentUser)
    case 'PUT':
      return await updateEmployer(req, res)
    case 'DELETE':
      return await deleteEmployer(req, res)
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

async function getEmployers(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('users')
      .select(`
        id, email, full_name, phone, company, role, is_active, is_approved, approval_status, created_at, updated_at,
        employer_approvals (id, status, approved_by, approved_at, rejection_reason, created_at)
      `)
      .eq('role', 'employer')
      .is('deleted_at', null)

    if (status) {
      query = query.eq('approval_status', status)
    }

    const { data: employers, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const formattedEmployers = employers.map(employer => ({
      id: employer.id,
      email: employer.email,
      fullName: employer.full_name,
      phone: employer.phone,
      company: employer.company,
      role: employer.role,
      isActive: employer.is_active,
      isApproved: employer.is_approved,
      approvalStatus: employer.approval_status,
      approvalDetails: employer.employer_approvals?.[0] || null,
      createdAt: employer.created_at,
      updatedAt: employer.updated_at
    }))

    return res.status(200).json({
      success: true,
      data: formattedEmployers,
      count: formattedEmployers.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch employers',
      details: error.message
    })
  }
}

async function handleEmployerAction(req, res, currentUser) {
  try {
    const { employerId, action, rejectionReason } = req.body

    if (!employerId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Employer ID and action are required'
      })
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either "approve" or "reject"'
      })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update user
    await supabase
      .from('users')
      .update({
        approval_status: newStatus,
        is_approved: action === 'approve'
      })
      .eq('id', employerId)

    // Update approval record
    const approvalData = {
      user_id: employerId,
      status: newStatus,
      approved_by: currentUser.id,
      approved_at: new Date().toISOString()
    }

    if (action === 'reject') {
      approvalData.rejection_reason = rejectionReason
    }

    await supabase.from('employer_approvals').upsert(approvalData)

    return res.status(200).json({
      success: true,
      message: `Employer ${action}d successfully`
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to process employer approval',
      details: error.message
    })
  }
}

async function updateEmployer(req, res) {
  try {
    const { id } = req.query
    const { isActive } = req.body

    if (!id || typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Employer ID and isActive boolean are required'
      })
    }

    await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', id)

    return res.status(200).json({
      success: true,
      message: `Employer ${isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update employer',
      details: error.message
    })
  }
}

async function deleteEmployer(req, res) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employer ID is required'
      })
    }

    await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id)

    return res.status(200).json({
      success: true,
      message: 'Employer deleted successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete employer',
      details: error.message
    })
  }
}

// ============================================================================
// BLOG MANAGEMENT
// ============================================================================

async function handleBlog(req, res, currentUser) {
  switch (req.method) {
    case 'GET':
      return await getBlogPosts(req, res)
    case 'POST':
      return await createBlogPost(req, res, currentUser)
    case 'PUT':
      return await updateBlogPost(req, res)
    case 'DELETE':
      return await deleteBlogPost(req, res)
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

async function getBlogPosts(req, res) {
  try {
    const { page = 1, limit = 20, category, published } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)

    if (category) query = query.eq('category', category)
    if (published !== undefined) query = query.eq('is_published', published === 'true')

    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return res.status(200).json({
      success: true,
      data: posts,
      count: posts.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts',
      details: error.message
    })
  }
}

async function createBlogPost(req, res, currentUser) {
  try {
    const { title, excerpt, content, category, imageUrl, isPublished = true } = req.body

    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, excerpt, content, and category are required'
      })
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title: title.trim(),
        slug: `${slug}-${Date.now()}`,
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

    if (error) throw error

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newPost
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create blog post',
      details: error.message
    })
  }
}

async function updateBlogPost(req, res) {
  try {
    const { id } = req.query
    const { title, excerpt, content, category, imageUrl, isPublished } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Blog post ID is required'
      })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title.trim()
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (category !== undefined) updateData.category = category.trim()
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (isPublished !== undefined) {
      updateData.is_published = isPublished
      if (isPublished) updateData.published_at = new Date().toISOString()
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedPost
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update blog post',
      details: error.message
    })
  }
}

async function deleteBlogPost(req, res) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Blog post ID is required'
      })
    }

    await supabase
      .from('blog_posts')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_published: false 
      })
      .eq('id', id)

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete blog post',
      details: error.message
    })
  }
}