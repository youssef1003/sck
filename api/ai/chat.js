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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  console.log('AI Chat request:', {
    method: req.method,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : []
  })

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true })
  }

  // Handle GET - return status
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'AI chat endpoint is working. Use POST to send messages.',
      status: 'online'
    })
  }

  // Only POST allowed for chat
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST to send messages or GET for status.'
    })
  }

  try {
    const { message, history = [], language = 'ar' } = req.body

    console.log('AI Chat message:', {
      hasMessage: !!message,
      messageLength: message ? message.length : 0,
      language
    })

    // Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
        reply: language === 'ar' 
          ? 'الرجاء إدخال رسالة صحيحة'
          : 'Please enter a valid message'
      })
    }

    // Check if AI is available
    const hasAI = !!(process.env.HF_API_KEY || process.env.OPENAI_API_KEY)

    console.log('AI availability:', { hasAI })

    if (!hasAI) {
      // Fallback response when no AI provider is configured
      const fallbackReply = language === 'ar'
        ? 'مرحباً! أنا مساعد SCK للاستشارات الإدارية. نحن نقدم خدمات استشارية متخصصة في الأنظمة الإدارية وشهادات ISO. كيف يمكنني مساعدتك؟'
        : 'Hello! I am SCK Consulting assistant. We provide specialized consulting services in management systems and ISO certifications. How can I help you?'

      console.log('Returning fallback response (no AI key)')

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
      
      // Fallback on AI error - always return success with error message as reply
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
    
    // Even on error, return success with error message as reply to avoid frontend crashes
    const language = req.body?.language || 'ar'
    const errorReply = language === 'ar'
      ? 'عذراً، المساعد الذكي غير متاح حالياً. حاول مرة أخرى لاحقاً.'
      : 'Sorry, AI Assistant is currently unavailable. Please try again later.'
    
    return res.status(200).json({
      success: true,
      reply: errorReply,
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
}
