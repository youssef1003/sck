import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Debug: Check environment variables first
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: 'Missing environment variables',
      debug: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    })
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
      error: 'Internal server error',
      details: error.message
    })
  }
}