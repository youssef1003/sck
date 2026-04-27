const { createClient } = require('@supabase/supabase-js')
const axios = require('axios')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const CONFIG = {
  MAX_CONTEXT_TOKENS: 3000,
  TOP_K_RESULTS: 5,
  SIMILARITY_THRESHOLD: 0.7,
  MAX_CONVERSATION_HISTORY: 10,
  GROK_MODEL: 'grok-beta',
  EMBEDDING_MODEL: 'text-embedding-ada-002'
}

async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: CONFIG.EMBEDDING_MODEL
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.data[0].embedding
  } catch (error) {
    console.error('Embedding error:', error.response?.data || error.message)
    throw new Error('Failed to generate embedding')
  }
}

async function searchSimilarDocuments(queryEmbedding, language = null, tenantId = null) {
  try {
    const { data, error } = await supabase.rpc('search_similar_documents', {
      query_embedding: queryEmbedding,
      match_threshold: CONFIG.SIMILARITY_THRESHOLD,
      match_count: CONFIG.TOP_K_RESULTS,
      filter_language: language,
      filter_tenant_id: tenantId
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Vector search error:', error)
    return []
  }
}

async function getConversationHistory(conversationId) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(CONFIG.MAX_CONVERSATION_HISTORY)

    if (error) throw error
    return (data || []).reverse()
  } catch (error) {
    console.error('History fetch error:', error)
    return []
  }
}

function buildContextPrompt(retrievedDocs, language = 'en') {
  if (!retrievedDocs || retrievedDocs.length === 0) {
    return language === 'ar' 
      ? 'لا توجد معلومات متاحة في قاعدة المعرفة.'
      : 'No relevant information found in the knowledge base.'
  }

  const contextParts = retrievedDocs.map((doc, idx) => {
    return `[${idx + 1}] ${doc.content}`
  })

  return contextParts.join('\n\n')
}

async function callGrokAPI(messages, temperature = 0.7) {
  try {
    const response = await axios.post(
      GROK_API_URL,
      {
        model: CONFIG.GROK_MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('Grok API error:', error.response?.data || error.message)
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout')
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded')
    }
    throw new Error('Failed to get response from AI')
  }
}

async function saveMessage(conversationId, role, content, contextUsed = null) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: role,
        content: content,
        context_used: contextUsed
      })

    if (error) throw error
  } catch (error) {
    console.error('Save message error:', error)
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, conversationId, language = 'en', userId } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    if (!GROK_API_KEY || !OPENAI_API_KEY) {
      return res.status(500).json({ error: 'API keys not configured' })
    }

    let currentConversationId = conversationId

    if (!currentConversationId && userId) {
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50),
          language: language
        })
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = newConv.id
    }

    const queryEmbedding = await generateEmbedding(message)
    
    const retrievedDocs = await searchSimilarDocuments(
      queryEmbedding,
      language,
      null
    )

    const context = buildContextPrompt(retrievedDocs, language)

    const conversationHistory = currentConversationId 
      ? await getConversationHistory(currentConversationId)
      : []

    const systemPrompt = language === 'ar'
      ? `أنت مساعد ذكي ومفيد. أجب على الأسئلة بناءً على المعلومات المقدمة فقط.
إذا لم تجد المعلومات في السياق، قل "لا أملك معلومات كافية للإجابة على هذا السؤال".
لا تختلق معلومات أو تقدم إجابات خارج السياق المعطى.`
      : `You are an intelligent and helpful assistant. Answer questions ONLY based on the provided context.
If you cannot find the information in the context, say "I don't have enough information to answer this question."
Do not make up information or provide answers outside the given context.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: `${language === 'ar' ? 'السياق' : 'Context'}:\n${context}\n\n${language === 'ar' ? 'السؤال' : 'Question'}: ${message}`
      }
    ]

    const aiResponse = await callGrokAPI(messages)

    if (currentConversationId) {
      await saveMessage(currentConversationId, 'user', message)
      await saveMessage(
        currentConversationId,
        'assistant',
        aiResponse,
        { retrieved_docs: retrievedDocs.map(d => ({ id: d.id, similarity: d.similarity })) }
      )
    }

    return res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: currentConversationId,
      contextUsed: retrievedDocs.length,
      sources: retrievedDocs.map(doc => ({
        type: doc.source_type,
        id: doc.source_id,
        similarity: doc.similarity
      }))
    })

  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error',
      fallback: req.body.language === 'ar'
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
        : 'Sorry, an error occurred. Please try again.'
    })
  }
}
