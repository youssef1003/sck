const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('CRITICAL: Missing Supabase credentials for recruitment-packages API')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

module.exports = async function handleRecruitmentPackages(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { slug } = req.query

    if (slug) {
      // Get single package by slug
      const { data, error } = await supabase
        .from('recruitment_packages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('Package fetch error:', error.message)
        return res.status(404).json({ 
          success: false, 
          error: 'Package not found' 
        })
      }

      return res.status(200).json({ success: true, data })
    }

    // Get all active packages
    const { data, error } = await supabase
      .from('recruitment_packages')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Packages fetch error:', error.message)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch packages' 
      })
    }

    return res.status(200).json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Recruitment packages API error:', error.message)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}
