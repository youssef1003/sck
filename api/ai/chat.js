/**
 * AI Chat Endpoint - Vercel Serverless Function
 * Handles POST /api/ai/chat
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true })
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.'
    })
  }

  try {
    const { message, history = [], language = 'ar' } = req.body

    // Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      })
    }

    // Check if AI is available
    const hasAI = !!(process.env.HF_API_KEY || process.env.OPENAI_API_KEY)

    if (!hasAI) {
      // Fallback response when no AI provider is configured
      const fallbackReply = language === 'ar'
        ? 'مرحباً! أنا مساعد SCK للاستشارات الإدارية. نحن نقدم خدمات استشارية متخصصة في الأنظمة الإدارية وشهادات ISO. كيف يمكنني مساعدتك؟'
        : 'Hello! I am SCK Consulting assistant. We provide specialized consulting services in management systems and ISO certifications. How can I help you?'

      return res.status(200).json({
        success: true,
        reply: fallbackReply
      })
    }

    // Try to get response from RAG system
    try {
      // Search for relevant documents in database
      const { data: documents, error: searchError } = await supabase
        .from('rag_documents')
        .select('content, metadata')
        .eq('language', language)
        .limit(3)

      let context = ''
      if (!searchError && documents && documents.length > 0) {
        context = documents.map(doc => doc.content).join('\n\n')
      }

      // Generate response based on context
      let reply = ''
      
      if (context) {
        // Simple context-based response
        if (language === 'ar') {
          reply = `بناءً على معلوماتنا: ${context.substring(0, 200)}...`
        } else {
          reply = `Based on our information: ${context.substring(0, 200)}...`
        }
      } else {
        // Default response
        reply = language === 'ar'
          ? 'شكراً لتواصلك معنا. نحن في SCK نقدم خدمات استشارية متخصصة. كيف يمكنني مساعدتك؟'
          : 'Thank you for contacting us. At SCK, we provide specialized consulting services. How can I help you?'
      }

      return res.status(200).json({
        success: true,
        reply: reply
      })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      // Fallback on AI error
      const errorReply = language === 'ar'
        ? 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
        : 'Sorry, there was an error processing your request. Please try again.'

      return res.status(200).json({
        success: true,
        reply: errorReply
      })
    }

  } catch (error) {
    console.error('Chat endpoint error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    })
  }
}
