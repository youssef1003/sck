const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('CRITICAL: Missing Supabase credentials for quote-requests API')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const {
        representative_name,
        representative_role,
        company_name,
        company_size,
        company_activity,
        vacancy_nature,
        challenges,
        employees_needed,
        required_professions,
        selected_package_slug,
        mobile,
        email
      } = req.body

      // Validation
      if (!representative_name || !representative_role || !company_name || 
          !company_size || !company_activity || !vacancy_nature || 
          !employees_needed || !mobile || !email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        })
      }

      // Validate mobile format (basic)
      if (mobile.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile number'
        })
      }

      // Insert quote request
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          representative_name,
          representative_role,
          company_name,
          company_size,
          company_activity,
          vacancy_nature,
          challenges: challenges || [],
          employees_needed: parseInt(employees_needed),
          required_professions: required_professions || [],
          selected_package_slug,
          mobile,
          email,
          status: 'new'
        })
        .select()

      if (error) {
        console.error('Quote request insert error:', error.message)
        return res.status(500).json({
          success: false,
          error: 'Failed to submit quote request'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'تم استلام طلبكم بنجاح. خبراؤنا يعكفون الآن على تحليل احتياجكم لاستخراج أفضل مستويات الجدارة المطلوبة. سنتواصل معكم بأقرب وقت ممكن.',
        data: data[0]
      })
    } catch (error) {
      console.error('Quote requests API error:', error.message)
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
