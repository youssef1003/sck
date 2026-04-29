const { createClient } = require('@supabase/supabase-js')
const axios = require('axios')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Hugging Face API (FREE!)
const HF_API_KEY = process.env.HF_API_KEY || 'hf_demo' // Free tier available
const HF_API_URL = 'https://api-inference.huggingface.co/models'

const CONFIG = {
  MAX_CONTEXT_TOKENS: 3000,
  TOP_K_RESULTS: 5,
  SIMILARITY_THRESHOLD: 0.6, // Lower threshold for simpler matching
  MAX_CONVERSATION_HISTORY: 10,
  // Free Hugging Face models
  CHAT_MODEL: 'mistralai/Mistral-7B-Instruct-v0.2', // Free, supports Arabic
  EMBEDDING_MODEL: 'sentence-transformers/all-MiniLM-L6-v2' // Free embeddings
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

// Generate embeddings using FREE Hugging Face
async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      `${HF_API_URL}/${CONFIG.EMBEDDING_MODEL}`,
      { inputs: text },
      { 
        headers: { 
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        timeout: 30000
      }
    )
    
    // Hugging Face returns embeddings directly
    return response.data
  } catch (error) {
    console.error('Embedding error:', error.message)
    // Fallback: simple text-based matching without embeddings
    return null
  }
}

// Search documents - with fallback to simple text search
async function searchSimilarDocuments(queryEmbedding, language = null, queryText = '') {
  // If embeddings available, use vector search
  if (queryEmbedding) {
    try {
      const { data, error } = await supabase.rpc('search_similar_documents', {
        query_embedding: queryEmbedding,
        match_threshold: CONFIG.SIMILARITY_THRESHOLD,
        match_count: CONFIG.TOP_K_RESULTS,
        filter_language: language,
        filter_tenant_id: null
      })
      if (!error && data && data.length > 0) {
        return data
      }
    } catch (error) {
      console.log('Vector search failed, falling back to text search')
    }
  }
  
  // Fallback: Simple text search
  let query = supabase
    .from('rag_documents')
    .select('*')
    .ilike('content', `%${queryText}%`)
    .limit(CONFIG.TOP_K_RESULTS)
  
  if (language) {
    query = query.eq('language', language)
  }
  
  const { data, error } = await query
  if (error) throw error
  
  return data || []
}

// Call FREE Hugging Face API for chat
async function callHuggingFaceAPI(prompt, language = 'en') {
  try {
    const response = await axios.post(
      `${HF_API_URL}/${CONFIG.CHAT_MODEL}`,
      { 
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      },
      { 
        headers: { 
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        timeout: 30000
      }
    )
    
    // Extract generated text
    const generatedText = response.data[0]?.generated_text || response.data
    return typeof generatedText === 'string' ? generatedText : JSON.stringify(generatedText)
  } catch (error) {
    console.error('Hugging Face API error:', error.message)
    // Fallback response
    return language === 'ar' 
      ? 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
      : 'Sorry, there was an error processing your request. Please try again.'
  }
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, conversationId, language = 'en', userId } = req.body

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  let currentConversationId = conversationId

  // Create conversation if needed
  if (!currentConversationId && userId) {
    try {
      const { data: newConv, error } = await supabase
        .from('chat_conversations')
        .insert({ user_id: userId, title: message.substring(0, 50), language })
        .select()
        .single()
      if (!error && newConv) {
        currentConversationId = newConv.id
      }
    } catch (error) {
      console.log('Could not create conversation:', error.message)
    }
  }

  // Generate embedding (optional - will fallback to text search if fails)
  const queryEmbedding = await generateEmbedding(message)
  
  // Search for relevant documents
  const retrievedDocs = await searchSimilarDocuments(queryEmbedding, language, message)
  
  // Build context from retrieved documents
  const context = retrievedDocs.length > 0
    ? retrievedDocs.map((doc, idx) => `[${idx + 1}] ${doc.content}`).join('\n\n')
    : (language === 'ar' ? 'لا توجد معلومات متاحة في قاعدة البيانات.' : 'No information available in the database.')

  // Build prompt for Hugging Face
  const systemPrompt = language === 'ar'
    ? 'أنت مساعد ذكي لشركة SCK للاستشارات. أجب بناءً على المعلومات المقدمة فقط. كن مختصراً ومفيداً.'
    : 'You are an intelligent assistant for SCK Consulting. Answer ONLY based on the provided context. Be concise and helpful.'

  const fullPrompt = `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${message}\n\nAnswer:`

  // Get AI response from Hugging Face (FREE!)
  const aiResponse = await callHuggingFaceAPI(fullPrompt, language)

  // Save messages if conversation exists
  if (currentConversationId) {
    try {
      await supabase.from('chat_messages').insert({ 
        conversation_id: currentConversationId, 
        role: 'user', 
        content: message 
      })
      await supabase.from('chat_messages').insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiResponse,
        context_used: { retrieved_docs: retrievedDocs.map(d => ({ id: d.id, similarity: d.similarity || 0 })) }
      })
    } catch (error) {
      console.log('Could not save messages:', error.message)
    }
  }

  return res.status(200).json({
    success: true,
    response: aiResponse,
    conversationId: currentConversationId,
    contextUsed: retrievedDocs.length,
    sources: retrievedDocs.map(doc => ({ 
      type: doc.source_type, 
      id: doc.source_id, 
      similarity: doc.similarity || 0 
    })),
    model: 'Hugging Face (Free)'
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

  // Generate embeddings (optional - can work without them)
  const embeddings = []
  for (const chunk of chunks) {
    const emb = await generateEmbedding(chunk)
    embeddings.push(emb)
    await new Promise(resolve => setTimeout(resolve, 200)) // Rate limiting
  }

  // Prepare documents
  const documents = chunks.map((chunk, index) => ({
    content: chunk,
    embedding: embeddings[index] || null, // null if embedding failed
    metadata: metadata || {},
    source_type: metadata?.sourceType || 'text',
    source_id: metadata?.sourceId || null,
    tenant_id: metadata?.tenantId || null,
    chunk_index: index,
    total_chunks: chunks.length,
    language: metadata?.language || 'en'
  }))

  // Insert into database
  const { error } = await supabase.from('rag_documents').insert(documents)
  if (error) throw error

  return res.status(200).json({
    success: true,
    chunksProcessed: documents.length,
    totalChunks: chunks.length,
    model: 'Hugging Face (Free)'
  })
}
