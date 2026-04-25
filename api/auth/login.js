const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters'

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

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      })
    }

    // For admin login, use direct verification
    if (email.toLowerCase() === 'admin@sck.com' && password === 'scq2025') {
      
      try {
        // Get admin user from database
        let { data: adminUser, error: adminError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'admin@sck.com')
          .single()

        // If admin user doesn't exist, create it
        if (adminError && adminError.code === 'PGRST116') {
          // User not found, create admin user
          const { data: newAdmin, error: createError } = await supabase
            .from('users')
            .insert({
              email: 'admin@sck.com',
              password_hash: '$2b$10$rQ8K8O.6WxLlO4r5FO4zLOKxGjmtVWwM1nF8qYjKqYjKqYjKqYjKq', // Pre-hashed 'scq2025'
              full_name: 'Super Admin',
              role: 'admin',
              is_active: true,
              approval_status: 'approved',
              metadata: { is_default_admin: true }
            })
            .select()
            .single()

          if (createError) {
            return res.status(500).json({ 
              success: false, 
              error: 'Failed to create admin user: ' + createError.message 
            })
          }

          adminUser = newAdmin
        } else if (adminError) {
          return res.status(500).json({ 
            success: false, 
            error: 'Database error: ' + adminError.message 
          })
        }

        if (!adminUser) {
          return res.status(401).json({ 
            success: false, 
            error: 'Admin user not found' 
          })
        }

        // Generate JWT tokens
        const tokenPayload = {
          user_id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        }

        const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })
        const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

        // Try to update last login (don't fail if this fails)
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', adminUser.id)
        } catch (updateError) {
          // Ignore update errors
        }

        return res.status(200).json({
          success: true,
          data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600,
            user: {
              id: adminUser.id,
              email: adminUser.email,
              full_name: adminUser.full_name || 'Super Admin',
              phone: adminUser.phone,
              company: adminUser.company,
              role: adminUser.role || 'admin',
              is_approved: true,
              approval_status: 'approved',
              permissions: ['*'], // Super admin has all permissions
              created_at: adminUser.created_at
            }
          }
        })
      } catch (dbError) {
        return res.status(500).json({ 
          success: false, 
          error: 'Database error: ' + dbError.message 
        })
      }
    }

    // For non-admin users
    return res.status(401).json({ 
      success: false, 
      error: 'Only admin login is currently supported. Please use admin@sck.com' 
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  }
}