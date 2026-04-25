const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test environment variables
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET
    }

    // Test database connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .limit(5)

    // Check for admin user specifically
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@sck.com')
      .single()

    return res.status(200).json({
      success: true,
      environment: envCheck,
      database: {
        connection: !usersError,
        usersCount: users?.length || 0,
        usersError: usersError?.message || null,
        adminUser: {
          found: !!adminUser,
          email: adminUser?.email || null,
          role: adminUser?.role || null,
          isActive: adminUser?.is_active || null,
          error: adminError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}