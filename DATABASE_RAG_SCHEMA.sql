-- ========================================
-- RAG SYSTEM DATABASE SCHEMA
-- ========================================
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- 1. DOCUMENTS TABLE (Knowledge Base)
-- ========================================
CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata JSONB DEFAULT '{}',
  source_type VARCHAR(50), -- 'pdf', 'text', 'blog', 'service', 'website'
  source_id VARCHAR(255), -- Reference to original content (blog_id, service_id, etc.)
  tenant_id UUID, -- Multi-tenant support (optional)
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  language VARCHAR(10) DEFAULT 'en', -- 'en' or 'ar'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rag_documents_tenant ON rag_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_language ON rag_documents(language);
CREATE INDEX IF NOT EXISTS idx_rag_documents_created ON rag_documents(created_at DESC);

-- Vector similarity search index (HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding ON rag_documents 
USING hnsw (embedding vector_cosine_ops);

-- ========================================
-- 2. CHAT CONVERSATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at DESC);

-- ========================================
-- 3. CHAT MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  context_used JSONB, -- Store retrieved chunks for debugging
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- ========================================
-- 4. INGESTION JOBS TABLE (Track document processing)
-- ========================================
CREATE TABLE IF NOT EXISTS rag_ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_chunks INTEGER DEFAULT 0,
  processed_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rag_ingestion_status ON rag_ingestion_jobs(status, created_at DESC);

-- ========================================
-- 5. VECTOR SEARCH FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION search_similar_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_language varchar DEFAULT NULL,
  filter_tenant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb,
  source_type varchar,
  source_id varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_documents.id,
    rag_documents.content,
    1 - (rag_documents.embedding <=> query_embedding) as similarity,
    rag_documents.metadata,
    rag_documents.source_type,
    rag_documents.source_id
  FROM rag_documents
  WHERE 
    (filter_language IS NULL OR rag_documents.language = filter_language)
    AND (filter_tenant_id IS NULL OR rag_documents.tenant_id = filter_tenant_id)
    AND 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all documents (public knowledge base)
CREATE POLICY "Public documents are viewable by everyone"
  ON rag_documents FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete documents
CREATE POLICY "Only admins can manage documents"
  ON rag_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only see messages in their conversations
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- ========================================
-- 7. HELPER FUNCTIONS
-- ========================================

-- Function to clean old conversations (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_conversations(days_old int DEFAULT 90)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM chat_conversations
  WHERE created_at < NOW() - (days_old || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to get conversation context (last N messages)
CREATE OR REPLACE FUNCTION get_conversation_context(
  conv_id uuid,
  message_limit int DEFAULT 10
)
RETURNS TABLE (
  role varchar,
  content text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_messages.role,
    chat_messages.content,
    chat_messages.created_at
  FROM chat_messages
  WHERE chat_messages.conversation_id = conv_id
  ORDER BY chat_messages.created_at DESC
  LIMIT message_limit;
END;
$$;

-- ========================================
-- 8. TRIGGERS
-- ========================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rag_documents_updated_at
  BEFORE UPDATE ON rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DONE! Schema ready for RAG system
-- ========================================
