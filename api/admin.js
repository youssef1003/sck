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
  const { data: users } = await supabase.from('users').select('*', { count: 'exact' })
  const { data: bookings } = await supabase.from('consultation_bookings').select('*', { count: 'exact' })
  const { data: contacts } = await supabase.from('contact_requests').select('*', { count: 'exact' })

  return res.status(200).json({
    success: true,
    stats: {
      totalUsers: users?.length || 0,
      totalBookings: bookings?.length || 0,
      totalContacts: contacts?.length || 0
    }
  })
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
