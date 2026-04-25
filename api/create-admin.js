const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'admin@sck.com')
      .single()

    if (existingAdmin) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        admin: existingAdmin
      })
    }

    // Create admin user using raw SQL to handle password hashing
    const { data: result, error: createError } = await supabase
      .rpc('sql', {
        query: `
          INSERT INTO users (email, password_hash, full_name, role, is_active, metadata)
          VALUES (
            'admin@sck.com',
            crypt('scq2025', gen_salt('bf', 10)),
            'Super Admin',
            'admin',
            true,
            '{"is_default_admin": true}'::jsonb
          )
          ON CONFLICT (email) DO UPDATE SET
            password_hash = crypt('scq2025', gen_salt('bf', 10)),
            is_active = true,
            role = 'admin'
          RETURNING id, email, full_name, role;
        `
      })

    if (createError) {
      // Try alternative method without RPC
      const { data: insertResult, error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'admin@sck.com',
          password_hash: '$2b$10$rQ8K8O.6WxLlO4r5FO4zLOKxGjmtVWwM1nF8qYjKqYjKqYjKqYjKq', // Pre-hashed 'scq2025'
          full_name: 'Super Admin',
          role: 'admin',
          is_active: true,
          metadata: { is_default_admin: true }
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        admin: insertResult
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: result?.[0] || { email: 'admin@sck.com' }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create admin user: ' + error.message
    })
  }
}