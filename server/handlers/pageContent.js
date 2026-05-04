const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, ''),
  process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')
)

module.exports = async function handlePageContent(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { page_key } = req.query

    if (!page_key) {
      return res.status(400).json({
        success: false,
        error: 'Missing page_key parameter'
      })
    }

    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_key', page_key)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Return default content if not found
    if (!data) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Page content not found, using defaults'
      })
    }

    return res.status(200).json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Page content error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}
