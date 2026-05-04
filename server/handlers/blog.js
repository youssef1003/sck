const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, ''),
  process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')
)

module.exports = async function handleBlog(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { search, limit = 100, offset = 0, category } = req.query

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (category && category !== 'الكل') {
      query = query.eq('category', category)
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Blog fetch error:', error)
      throw error
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: count || 0
    })
  } catch (error) {
    console.error('Blog API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      data: []
    })
  }
}
