const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('CRITICAL: Missing Supabase credentials for services API')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { slug } = req.query

      if (slug) {
        // Get single service by slug
        const { data, error } = await supabase
          .from('service_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .is('deleted_at', null)
          .single()

        if (error) {
          console.error('Service fetch error:', error.message)
          return res.status(404).json({ 
            success: false, 
            error: 'Service not found' 
          })
        }

        return res.status(200).json({ success: true, data })
      }

      // Get all active services
      const { data, error } = await supabase
        .from('service_pages')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Services fetch error:', error.message)
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch services' 
        })
      }

      return res.status(200).json({ success: true, data: data || [] })
    } catch (error) {
      console.error('Services API error:', error.message)
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      })
    }
  }

  return res.status(405).json({ 
    success: false, 
    error: 'Method not allowed' 
  })
}
