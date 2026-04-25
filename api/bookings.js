const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { 
      name, 
      email, 
      phone, 
      company, 
      serviceType, 
      preferredDate, 
      preferredTime, 
      notes 
    } = req.body

    // Validation
    if (!name || !email || !phone || !serviceType) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, phone, and service type are required'
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

    // Date validation (if provided)
    if (preferredDate) {
      const date = new Date(preferredDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (date < today) {
        return res.status(400).json({
          success: false,
          error: 'Preferred date cannot be in the past'
        })
      }
    }

    // Insert consultation booking
    const { data: booking, error } = await supabase
      .from('consultation_bookings')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        company: company ? company.trim() : null,
        service_type: serviceType.trim(),
        preferred_date: preferredDate || null,
        preferred_time: preferredTime ? preferredTime.trim() : null,
        notes: notes ? notes.trim() : null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Booking Error:', error)
      throw error
    }

    return res.status(201).json({
      success: true,
      message: 'تم حجز الاستشارة بنجاح. سنتواصل معك لتأكيد الموعد.',
      data: {
        id: booking.id,
        status: booking.status,
        bookingNumber: `SCQ-${booking.id.substring(0, 8).toUpperCase()}`
      }
    })

  } catch (error) {
    console.error('Bookings API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء حجز الاستشارة. يرجى المحاولة مرة أخرى.',
      details: error.message
    })
  }
}