-- ============================================================================
-- Complete Database Fix for SCK Platform
-- Run this in Supabase SQL Editor to fix ALL issues
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 1. Fix Users Table and Super Admin
-- ============================================================================

-- Ensure users table has all required columns
DO $$
BEGIN
    -- Add password_hash if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Add role if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'client';
    END IF;
    
    -- Add is_active if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last_login_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add deleted_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Fix Super Admin with correct password
INSERT INTO users (email, password_hash, full_name, role, is_active, metadata)
VALUES (
    'admin@sck.com',
    crypt('scq2025', gen_salt('bf', 10)),
    'Super Admin',
    'admin',
    true,
    '{"is_default_admin": true}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('scq2025', gen_salt('bf', 10)),
    is_active = true,
    role = 'admin',
    deleted_at = NULL;

-- ============================================================================
-- 2. Create AI Chatbot Tables
-- ============================================================================

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'ar',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_used JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RAG Documents Table (with vector support)
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    embedding vector(384),  -- For sentence-transformers/all-MiniLM-L6-v2
    metadata JSONB DEFAULT '{}'::jsonb,
    source_type VARCHAR(50),
    source_id VARCHAR(255),
    tenant_id UUID,
    chunk_index INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. Create Required Functions
-- ============================================================================

-- Update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- Password verification function (CRITICAL for login)
CREATE OR REPLACE FUNCTION verify_user_password(user_email TEXT, user_password TEXT) 
RETURNS TABLE(
    id UUID,
    email VARCHAR(255),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20),
    is_active BOOLEAN,
    is_approved BOOLEAN,
    approval_status VARCHAR(20),
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.full_name, u.phone, u.company, u.role, 
           u.is_active, u.is_approved, u.approval_status, u.last_login_at, 
           u.metadata, u.created_at, u.updated_at
    FROM users u
    WHERE u.email = user_email 
      AND u.password_hash = crypt(user_password, u.password_hash)
      AND u.deleted_at IS NULL;
END;
$$;

-- Search similar documents function (for RAG)
CREATE OR REPLACE FUNCTION search_similar_documents(
    query_embedding vector(384),
    match_threshold FLOAT DEFAULT 0.6,
    match_count INT DEFAULT 5,
    filter_language TEXT DEFAULT NULL,
    filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    source_type VARCHAR(50),
    source_id VARCHAR(255),
    similarity FLOAT,
    language VARCHAR(10)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.content,
        d.metadata,
        d.source_type,
        d.source_id,
        1 - (d.embedding <=> query_embedding) AS similarity,
        d.language
    FROM rag_documents d
    WHERE 
        (filter_language IS NULL OR d.language = filter_language)
        AND (filter_tenant_id IS NULL OR d.tenant_id = filter_tenant_id)
        AND d.embedding IS NOT NULL
        AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 4. Create Indexes for Performance
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at ASC);

-- RAG indexes
CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_language ON rag_documents(language);
CREATE INDEX IF NOT EXISTS idx_rag_documents_tenant ON rag_documents(tenant_id) WHERE tenant_id IS NOT NULL;

-- Vector similarity index (for fast RAG search)
CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding ON rag_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- 5. Create Triggers
-- ============================================================================

-- Chat conversations trigger
DROP TRIGGER IF EXISTS trigger_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated_at 
    BEFORE UPDATE ON chat_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RAG documents trigger
DROP TRIGGER IF EXISTS trigger_rag_documents_updated_at ON rag_documents;
CREATE TRIGGER trigger_rag_documents_updated_at 
    BEFORE UPDATE ON rag_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 6. Insert Sample RAG Content (Arabic)
-- ============================================================================

-- Insert SCK company information in Arabic
INSERT INTO rag_documents (content, source_type, source_id, language, metadata)
VALUES 
(
    'شركة SCQ للاستشارات الإدارية هي شركة متخصصة في تقديم الاستشارات الإدارية وشهادات ISO. نحن نساعد الشركات على تحسين أنظمتها الإدارية والحصول على شهادات الجودة العالمية.',
    'company_info',
    'about',
    'ar',
    '{"category": "about", "priority": "high"}'::jsonb
),
(
    'نقدم خدمات متنوعة تشمل: الاستشارات الإدارية، تطوير الموارد البشرية، التخطيط الاستراتيجي، إدارة المشاريع، والحصول على شهادات ISO 9001 و ISO 14001 و ISO 45001.',
    'company_info',
    'services',
    'ar',
    '{"category": "services", "priority": "high"}'::jsonb
),
(
    'للتواصل معنا: يمكنكم التواصل عبر البريد الإلكتروني admin@sck.com أو من خلال نموذج التواصل في الموقع. نحن متواجدون لخدمتكم من السبت إلى الخميس من الساعة 9 صباحاً حتى 5 مساءً.',
    'company_info',
    'contact',
    'ar',
    '{"category": "contact", "priority": "high"}'::jsonb
),
(
    'شهادة ISO 9001 هي شهادة عالمية لإدارة الجودة. تساعد الشركات على تحسين عملياتها وزيادة رضا العملاء. نحن نقدم استشارات شاملة للحصول على هذه الشهادة.',
    'company_info',
    'iso_9001',
    'ar',
    '{"category": "certifications", "priority": "medium"}'::jsonb
),
(
    'نقدم برامج تدريبية متخصصة في مجالات الإدارة والجودة والموارد البشرية. جميع برامجنا معتمدة ومصممة لتلبية احتياجات السوق السعودي.',
    'company_info',
    'training',
    'ar',
    '{"category": "training", "priority": "medium"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. Disable RLS (for serverless functions)
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. Verification
-- ============================================================================

-- Test Super Admin login
DO $$
DECLARE
    test_result RECORD;
BEGIN
    SELECT * INTO test_result FROM verify_user_password('admin@sck.com', 'scq2025');
    
    IF test_result.id IS NOT NULL THEN
        RAISE NOTICE '✅ Super Admin login test: SUCCESS';
        RAISE NOTICE '   Email: %', test_result.email;
        RAISE NOTICE '   Role: %', test_result.role;
    ELSE
        RAISE NOTICE '❌ Super Admin login test: FAILED';
    END IF;
END $$;

-- Count tables
SELECT 
    'users' as table_name, 
    COUNT(*) as count 
FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'chat_conversations', 
    COUNT(*) 
FROM chat_conversations
UNION ALL
SELECT 
    'rag_documents', 
    COUNT(*) 
FROM rag_documents;

-- Success message
SELECT '✅ Database setup completed successfully!' as status,
       'Login: admin@sck.com / scq2025' as credentials,
       'All tables, functions, and indexes created' as details;
