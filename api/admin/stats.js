const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters'

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

    // For now, return mock stats (will be connected to real database later)
    const stats = {
      users: 15,
      bookings: 8,
      contacts: 12,
      blog_posts: 5,
      new_messages: 3,
      pending_bookings: 2,
      employers: 6,
      pending_employers: 2,
      subadmins: 2
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
