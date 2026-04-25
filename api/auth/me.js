const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'sck_super_secret_key_2025_production'

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

    // For admin user, return hardcoded data
    if (decoded.email === 'admin@sck.com' && decoded.role === 'admin') {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: decoded.user_id,
            email: decoded.email,
            full_name: 'Super Admin',
            phone: null,
            company: null,
            role: decoded.role,
            is_active: true,
            is_approved: true,
            approval_status: 'approved',
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            permissions: ['*']
          }
        }
      })
    }

    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    })

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message
    })
  }
}