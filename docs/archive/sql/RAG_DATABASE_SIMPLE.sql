-- Simple RAG Database Setup (No complex vector functions needed)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. RAG Documents Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    embedding JSONB, -- Can be null, will use text search as fallback
    metadata JSONB DEFAULT '{}'::jsonb,
    source_type VARCHAR(50) DEFAULT 'text',
    source_id VARCHAR(255),
    tenant_id UUID,
    chunk_index INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast text search
CREATE INDEX IF NOT EXISTS idx_rag_documents_content ON rag_documents USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_rag_documents_language ON rag_documents(language);
CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents(source_type, source_id);

-- ============================================================================
-- 2. Chat Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, created_at DESC);

-- ============================================================================
-- 3. Chat Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_used JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at ASC);

-- ============================================================================
-- 4. Update Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rag_documents_updated_at ON rag_documents;
CREATE TRIGGER trigger_rag_documents_updated_at
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. Simple Search Function (Text-based, no vectors needed)
-- ============================================================================
CREATE OR REPLACE FUNCTION search_similar_documents(
    query_embedding JSONB,
    match_threshold FLOAT DEFAULT 0.6,
    match_count INT DEFAULT 5,
    filter_language VARCHAR DEFAULT NULL,
    filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    source_type VARCHAR,
    source_id VARCHAR,
    similarity FLOAT
) AS $$
BEGIN
    -- Simple fallback: return all documents (will be filtered by text search in API)
    RETURN QUERY
    SELECT 
        d.id,
        d.content,
        d.metadata,
        d.source_type,
        d.source_id,
        0.5::FLOAT as similarity
    FROM rag_documents d
    WHERE (filter_language IS NULL OR d.language = filter_language)
      AND (filter_tenant_id IS NULL OR d.tenant_id = filter_tenant_id)
    ORDER BY d.created_at DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Enable RLS (Optional - for security)
-- ============================================================================
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (you can restrict later)
CREATE POLICY "Allow all access" ON rag_documents FOR ALL USING (true);
CREATE POLICY "Allow all access" ON chat_conversations FOR ALL USING (true);
CREATE POLICY "Allow all access" ON chat_messages FOR ALL USING (true);

-- ============================================================================
-- 7. Insert Sample Content
-- ============================================================================
INSERT INTO rag_documents (content, source_type, language, metadata) VALUES
(
    'شركة SCK للاستشارات هي شركة رائدة في مجال الاستشارات الإدارية والموارد البشرية. نقدم خدمات متميزة للشركات والمؤسسات في المملكة العربية السعودية ومنطقة الخليج.',
    'company_info',
    'ar',
    '{"category": "about", "priority": "high"}'::jsonb
),
(
    'SCK Consulting is a leading company in management consulting and human resources. We provide distinguished services to companies and institutions in Saudi Arabia and the Gulf region.',
    'company_info',
    'en',
    '{"category": "about", "priority": "high"}'::jsonb
),
(
    'نقدم خدمات الاستشارات الإدارية، تطوير الموارد البشرية، التخطيط الاستراتيجي، وإدارة المشاريع. جميع خدماتنا مصممة خصيصاً لتلبية احتياجات عملائنا.',
    'services',
    'ar',
    '{"category": "services", "priority": "high"}'::jsonb
),
(
    'We offer management consulting, human resources development, strategic planning, and project management services. All our services are specially designed to meet our clients needs.',
    'services',
    'en',
    '{"category": "services", "priority": "high"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'RAG Database setup completed successfully! ✅' AS result;
SELECT 'Tables created: rag_documents, chat_conversations, chat_messages' AS info;
SELECT 'Sample content added for testing' AS info;
