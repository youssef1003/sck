-- SCK Consulting Platform Database Schema
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Uses UUID for all primary keys (modern, scalable, secure)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (for client accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20) DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation Bookings Table
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    service_type VARCHAR(100) NOT NULL,
    preferred_date DATE,
    preferred_time VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chat Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    messages JSONB NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_contact_requests_user_id ON contact_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_id ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_created_at ON consultation_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(email);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Insert sample blog posts (only if table is empty)
INSERT INTO blog_posts (title, excerpt, content, author, category, image_url)
SELECT * FROM (VALUES
    (
        'كيف تبني استراتيجية عمل ناجحة في 2026',
        'دليل شامل لبناء استراتيجية عمل قوية تساعدك على تحقيق أهدافك وتجاوز المنافسين',
        'في عالم الأعمال المتغير باستمرار، تعد الاستراتيجية الواضحة والمدروسة هي مفتاح النجاح. في هذا المقال، سنستعرض الخطوات الأساسية لبناء استراتيجية عمل ناجحة تتضمن تحليل السوق، تحديد الأهداف الذكية، وبناء خطة تنفيذية قابلة للقياس.',
        'فريق SCK',
        'استراتيجية',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop'
    ),
    (
        'أهمية الموارد البشرية في نجاح الشركات',
        'كيف يمكن لإدارة الموارد البشرية الفعالة أن تحدث فرقاً كبيراً في أداء شركتك',
        'الموارد البشرية هي العمود الفقري لأي منظمة ناجحة. في هذا المقال، نستكشف كيف يمكن لاستراتيجية موارد بشرية قوية أن تحول أداء شركتك من خلال التوظيف الذكي، تطوير المواهب، وبناء ثقافة عمل محفزة.',
        'فريق SCK',
        'موارد بشرية',
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop'
    ),
    (
        'التحول الرقمي: ضرورة أم خيار؟',
        'لماذا أصبح التحول الرقمي ضرورة حتمية للشركات في العصر الحديث',
        'في عصر التكنولوجيا المتسارع، لم يعد التحول الرقمي خياراً بل ضرورة للبقاء والمنافسة. نستعرض في هذا المقال أهمية التحول الرقمي وكيفية تطبيقه بنجاح في شركتك.',
        'فريق SCK',
        'تكنولوجيا',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop'
    )
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);
