const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handleContact(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { name, email, phone, businessType, message } = req.body

    // Validation
    if (!name || !email || !phone || !businessType || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      })
    }

    // Insert contact request
    const { data: contactRequest, error } = await supabase
      .from('contact_requests')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        business_type: businessType.trim(),
        message: message.trim(),
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      console.error('Contact Request Error:', error)
      throw error
    }

    return res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.',
      data: {
        id: contactRequest.id,
        status: contactRequest.status
      }
    })

  } catch (error) {
    console.error('Contact API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
      details: error.message
    })
  }
}
