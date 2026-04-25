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
    console.error('Employers API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// GET - List all employers with approval status
async function handleGet(req, res, currentUser) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        company,
        role,
        is_active,
        is_approved,
        approval_status,
        created_at,
        updated_at,
        employer_approvals (
          id,
          status,
          approved_by,
          approved_at,
          rejection_reason,
          created_at
        )
      `)
      .eq('role', 'employer')
      .is('deleted_at', null)

    // Filter by approval status if provided
    if (status) {
      query = query.eq('approval_status', status)
    }

    const { data: employers, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get total count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'employer')
      .is('deleted_at', null)

    // Format the response
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
      count: formattedEmployers.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    })

  } catch (error) {
    console.error('Get Employers Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch employers',
      details: error.message
    })
  }
}

// POST - Handle employer approval/rejection
async function handlePost(req, res, currentUser) {
  try {
    const { employerId, action, rejectionReason } = req.body

    // Validation
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

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      })
    }

    // Check if employer exists
    const { data: employer, error: employerError } = await supabase
      .from('users')
      .select('id, role, approval_status')
      .eq('id', employerId)
      .eq('role', 'employer')
      .is('deleted_at', null)
      .single()

    if (employerError || !employer) {
      return res.status(404).json({
        success: false,
        error: 'Employer not found'
      })
    }

    const now = new Date().toISOString()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update user approval status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        approval_status: newStatus,
        is_approved: action === 'approve'
      })
      .eq('id', employerId)

    if (updateError) {
      throw updateError
    }

    // Update or create employer approval record
    const approvalData = {
      user_id: employerId,
      status: newStatus,
      approved_by: currentUser.id,
      approved_at: now
    }

    if (action === 'reject') {
      approvalData.rejection_reason = rejectionReason
    }

    const { error: approvalError } = await supabase
      .from('employer_approvals')
      .upsert(approvalData)

    if (approvalError) {
      throw approvalError
    }

    return res.status(200).json({
      success: true,
      message: `Employer ${action}d successfully`
    })

  } catch (error) {
    console.error('Employer Approval Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to process employer approval',
      details: error.message
    })
  }
}

// PUT - Update employer status (activate/deactivate)
async function handlePut(req, res, currentUser) {
  try {
    const { id } = req.query
    const { isActive } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employer ID is required'
      })
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      })
    }

    // Check if employer exists
    const { data: employer, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .eq('role', 'employer')
      .is('deleted_at', null)
      .single()

    if (checkError || !employer) {
      return res.status(404).json({
        success: false,
        error: 'Employer not found'
      })
    }

    // Update employer status
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    return res.status(200).json({
      success: true,
      message: `Employer ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error('Update Employer Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update employer',
      details: error.message
    })
  }
}

// DELETE - Delete employer (soft delete)
async function handleDelete(req, res, currentUser) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employer ID is required'
      })
    }

    // Check if employer exists
    const { data: employer, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .eq('role', 'employer')
      .is('deleted_at', null)
      .single()

    if (checkError || !employer) {
      return res.status(404).json({
        success: false,
        error: 'Employer not found'
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
      message: 'Employer deleted successfully'
    })

  } catch (error) {
    console.error('Delete Employer Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete employer',
      details: error.message
    })
  }
}