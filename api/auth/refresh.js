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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refresh token is required' 
      })
    }

    // Verify refresh token
    const decoded = verifyToken(refresh_token)
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      })
    }

    // For admin user, create new tokens
    if (decoded.email === 'admin@sck.com' && decoded.role === 'admin') {
      const tokenData = {
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role
      }

      const accessToken = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1h' })
      const newRefreshToken = jwt.sign({ user_id: decoded.user_id }, JWT_SECRET, { expiresIn: '7d' })

      return res.status(200).json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: 3600
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