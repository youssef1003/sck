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
    console.error('Sub-Admins API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// GET - List all sub-admins
async function handleGet(req, res, currentUser) {
  try {
    const { data: subAdmins, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        company,
        role,
        is_active,
        created_at,
        updated_at,
        admin_permissions (
          permissions
        )
      `)
      .eq('role', 'subadmin')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Format the response
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
    console.error('Get Sub-Admins Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch sub-admins',
      details: error.message
    })
  }
}

// POST - Create new sub-admin
async function handlePost(req, res, currentUser) {
  try {
    const { email, fullName, phone, company, permissions = [] } = req.body

    // Validation
    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email and full name are required'
      })
    }

    // Check if email already exists
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

    // Generate temporary password
    const tempPassword = 'temp' + Math.random().toString(36).substring(2, 15)

    // Create user with raw SQL to handle password hashing
    const { data: newUser, error: userError } = await supabase.rpc('create_subadmin_user', {
      p_email: email,
      p_password: tempPassword,
      p_full_name: fullName,
      p_phone: phone || null,
      p_company: company || null
    })

    if (userError) {
      throw userError
    }

    // Get the created user ID
    const { data: createdUser, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (getUserError || !createdUser) {
      throw new Error('Failed to retrieve created user')
    }

    // Create permissions record
    const { error: permError } = await supabase
      .from('admin_permissions')
      .insert({
        user_id: createdUser.id,
        permissions: permissions
      })

    if (permError) {
      // Rollback user creation
      await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', createdUser.id)
      
      throw permError
    }

    return res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      data: {
        id: createdUser.id,
        email: email,
        fullName: fullName,
        tempPassword: tempPassword
      }
    })

  } catch (error) {
    console.error('Create Sub-Admin Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create sub-admin',
      details: error.message
    })
  }
}

// PUT - Update sub-admin
async function handlePut(req, res, currentUser) {
  try {
    const { id } = req.query
    const { fullName, phone, company, permissions, isActive } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Sub-admin ID is required'
      })
    }

    // Check if sub-admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .eq('role', 'subadmin')
      .is('deleted_at', null)
      .single()

    if (checkError || !existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Sub-admin not found'
      })
    }

    // Update user info
    const updateData = {}
    if (fullName !== undefined) updateData.full_name = fullName
    if (phone !== undefined) updateData.phone = phone
    if (company !== undefined) updateData.company = company
    if (isActive !== undefined) updateData.is_active = isActive

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }
    }

    // Update permissions if provided
    if (permissions !== undefined) {
      const { error: permError } = await supabase
        .from('admin_permissions')
        .upsert({
          user_id: id,
          permissions: permissions
        })

      if (permError) {
        throw permError
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Sub-admin updated successfully'
    })

  } catch (error) {
    console.error('Update Sub-Admin Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update sub-admin',
      details: error.message
    })
  }
}

// DELETE - Delete sub-admin (soft delete)
async function handleDelete(req, res, currentUser) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Sub-admin ID is required'
      })
    }

    // Check if sub-admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .eq('role', 'subadmin')
      .is('deleted_at', null)
      .single()

    if (checkError || !existingAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Sub-admin not found'
      })
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return res.status(200).json({
      success: true,
      message: 'Sub-admin deleted successfully'
    })

  } catch (error) {
    console.error('Delete Sub-Admin Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete sub-admin',
      details: error.message
    })
  }
}