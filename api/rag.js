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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { action } = req.query

  try {
    switch (action) {
      case 'chat':
        return await handleChat(req, res)
      case 'ingest':
        return await handleIngest(req, res)
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('RAG error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

async function generateEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    { input: text, model: CONFIG.EMBEDDING_MODEL },
    { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
  )
  return response.data.data[0].embedding
}

async function searchSimilarDocuments(queryEmbedding, language = null) {
  const { data, error } = await supabase.rpc('search_similar_documents', {
    query_embedding: queryEmbedding,
    match_threshold: CONFIG.SIMILARITY_THRESHOLD,
    match_count: CONFIG.TOP_K_RESULTS,
    filter_language: language,
    filter_tenant_id: null
  })
  if (error) throw error
  return data || []
}

async function callGrokAPI(messages) {
  const response = await axios.post(
    GROK_API_URL,
    { model: CONFIG.GROK_MODEL, messages, temperature: 0.7, max_tokens: 1000 },
    { headers: { 'Authorization': `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
  )
  return response.data.choices[0].message.content
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, conversationId, language = 'en', userId } = req.body

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  if (!GROK_API_KEY || !OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API keys not configured' })
  }

  let currentConversationId = conversationId

  if (!currentConversationId && userId) {
    const { data: newConv, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: userId, title: message.substring(0, 50), language })
      .select()
      .single()
    if (error) throw error
    currentConversationId = newConv.id
  }

  const queryEmbedding = await generateEmbedding(message)
  const retrievedDocs = await searchSimilarDocuments(queryEmbedding, language)
  
  const context = retrievedDocs.length > 0
    ? retrievedDocs.map((doc, idx) => `[${idx + 1}] ${doc.content}`).join('\n\n')
    : (language === 'ar' ? 'لا توجد معلومات متاحة.' : 'No information available.')

  const systemPrompt = language === 'ar'
    ? 'أنت مساعد ذكي. أجب بناءً على المعلومات المقدمة فقط.'
    : 'You are an intelligent assistant. Answer ONLY based on the provided context.'

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${language === 'ar' ? 'السياق' : 'Context'}:\n${context}\n\n${language === 'ar' ? 'السؤال' : 'Question'}: ${message}` }
  ]

  const aiResponse = await callGrokAPI(messages)

  if (currentConversationId) {
    await supabase.from('chat_messages').insert({ conversation_id: currentConversationId, role: 'user', content: message })
    await supabase.from('chat_messages').insert({
      conversation_id: currentConversationId,
      role: 'assistant',
      content: aiResponse,
      context_used: { retrieved_docs: retrievedDocs.map(d => ({ id: d.id, similarity: d.similarity })) }
    })
  }

  return res.status(200).json({
    success: true,
    response: aiResponse,
    conversationId: currentConversationId,
    contextUsed: retrievedDocs.length,
    sources: retrievedDocs.map(doc => ({ type: doc.source_type, id: doc.source_id, similarity: doc.similarity }))
  })
}

async function handleIngest(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content, metadata } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' })
  }

  // Simple chunking
  const chunks = []
  const maxSize = 800
  let currentChunk = ''
  
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content]
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }
  if (currentChunk.trim().length > 100) {
    chunks.push(currentChunk.trim())
  }

  const embeddings = []
  for (const chunk of chunks) {
    const emb = await generateEmbedding(chunk)
    embeddings.push(emb)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const documents = chunks.map((chunk, index) => ({
    content: chunk,
    embedding: embeddings[index],
    metadata: metadata || {},
    source_type: metadata?.sourceType || 'text',
    source_id: metadata?.sourceId || null,
    tenant_id: metadata?.tenantId || null,
    chunk_index: index,
    total_chunks: chunks.length,
    language: metadata?.language || 'en'
  }))

  const { error } = await supabase.from('rag_documents').insert(documents)
  if (error) throw error

  return res.status(200).json({
    success: true,
    chunksProcessed: documents.length,
    totalChunks: chunks.length
  })
}
