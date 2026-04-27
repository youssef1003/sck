const { createClient } = require('@supabase/supabase-js')
const axios = require('axios')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const EMBEDDING_MODEL = 'text-embedding-ada-002'

const CHUNK_CONFIG = {
  MAX_CHUNK_SIZE: 800,
  OVERLAP_SIZE: 100,
  MIN_CHUNK_SIZE: 100
}

function chunkText(text, maxSize = CHUNK_CONFIG.MAX_CHUNK_SIZE, overlap = CHUNK_CONFIG.OVERLAP_SIZE) {
  const chunks = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      const words = currentChunk.split(' ')
      currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ' + sentence
    } else {
      currentChunk += sentence
    }
  }
  
  if (currentChunk.trim().length > CHUNK_CONFIG.MIN_CHUNK_SIZE) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.length > 0 ? chunks : [text]
}

async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: EMBEDDING_MODEL
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

async function batchGenerateEmbeddings(texts) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: texts,
        model: EMBEDDING_MODEL
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.data.map(item => item.embedding)
  } catch (error) {
    console.error('Batch embedding error:', error.response?.data || error.message)
    const embeddings = []
    for (const text of texts) {
      try {
        const emb = await generateEmbedding(text)
        embeddings.push(emb)
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        embeddings.push(null)
      }
    }
    return embeddings
  }
}

async function ingestDocument(content, metadata = {}) {
  const {
    sourceType = 'text',
    sourceId = null,
    tenantId = null,
    language = 'en'
  } = metadata

  try {
    const jobId = crypto.randomUUID()
    
    await supabase.from('rag_ingestion_jobs').insert({
      id: jobId,
      source_type: sourceType,
      source_id: sourceId,
      status: 'processing',
      metadata: metadata
    })

    const chunks = chunkText(content)
    const totalChunks = chunks.length

    await supabase
      .from('rag_ingestion_jobs')
      .update({ total_chunks: totalChunks })
      .eq('id', jobId)

    const embeddings = await batchGenerateEmbeddings(chunks)

    const documents = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      metadata: metadata,
      source_type: sourceType,
      source_id: sourceId,
      tenant_id: tenantId,
      chunk_index: index,
      total_chunks: totalChunks,
      language: language
    })).filter(doc => doc.embedding !== null)

    const { error: insertError } = await supabase
      .from('rag_documents')
      .insert(documents)

    if (insertError) throw insertError

    await supabase
      .from('rag_ingestion_jobs')
      .update({
        status: 'completed',
        processed_chunks: documents.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    return {
      success: true,
      jobId: jobId,
      chunksProcessed: documents.length,
      totalChunks: totalChunks
    }

  } catch (error) {
    console.error('Ingestion error:', error)
    throw error
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
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { content, metadata } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    const result = await ingestDocument(content, metadata)

    return res.status(200).json(result)

  } catch (error) {
    console.error('Ingest handler error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error'
    })
  }
}

module.exports.ingestDocument = ingestDocument
