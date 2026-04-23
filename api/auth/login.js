module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      })
    }

    // Simple test login for admin
    if (email === 'admin@sck.com' && password === 'scq2025') {
      return res.status(200).json({
        success: true,
        data: {
          access_token: 'test-token-123',
          refresh_token: 'refresh-token-123',
          expires_in: 3600,
          user: {
            id: '123',
            email: 'admin@sck.com',
            full_name: 'Super Admin',
            role: 'admin',
            is_approved: true,
            permissions: ['*']
          }
        }
      })
    }

    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  }
}