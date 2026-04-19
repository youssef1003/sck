-- ============================================================================
-- SCK Consulting Platform — Enterprise Production Schema v3
-- Fully idempotent · Multi-tenant · Scalable · Zero-error
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================== TABLES =====================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20) DEFAULT 'client',
    tenant_id UUID,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_range VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    tenant_id UUID,
    assigned_to UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    service_type VARCHAR(100),
    service_id UUID,
    preferred_date DATE,
    preferred_time VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    tenant_id UUID,
    assigned_to UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    author_id UUID,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    context JSONB,
    tenant_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(20) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================== SAFE COLUMN ADDITIONS =====================
DO $$
BEGIN
    -- users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'client';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    -- contact_requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_requests' AND column_name='tenant_id') THEN
        ALTER TABLE contact_requests ADD COLUMN tenant_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_requests' AND column_name='deleted_at') THEN
        ALTER TABLE contact_requests ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_requests' AND column_name='assigned_to') THEN
        ALTER TABLE contact_requests ADD COLUMN assigned_to UUID;
    END IF;
    -- consultation_bookings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='tenant_id') THEN
        ALTER TABLE consultation_bookings ADD COLUMN tenant_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='deleted_at') THEN
        ALTER TABLE consultation_bookings ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='service_id') THEN
        ALTER TABLE consultation_bookings ADD COLUMN service_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='assigned_to') THEN
        ALTER TABLE consultation_bookings ADD COLUMN assigned_to UUID;
    END IF;
    -- blog_posts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='is_published') THEN
        ALTER TABLE blog_posts ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='deleted_at') THEN
        ALTER TABLE blog_posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='slug') THEN
        ALTER TABLE blog_posts ADD COLUMN slug VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_id') THEN
        ALTER TABLE blog_posts ADD COLUMN author_id UUID;
    END IF;
    -- ai_conversations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='tenant_id') THEN
        ALTER TABLE ai_conversations ADD COLUMN tenant_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='title') THEN
        ALTER TABLE ai_conversations ADD COLUMN title VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='metadata') THEN
        ALTER TABLE ai_conversations ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- ===================== MIGRATE: ai_conversations.messages → ai_messages =====================
-- Move JSONB messages into the normalized ai_messages table, then deprecate the column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='messages') THEN
        INSERT INTO ai_messages (conversation_id, role, content, created_at)
        SELECT c.id,
               COALESCE(msg->>'role', 'user'),
               COALESCE(msg->>'content', ''),
               COALESCE((msg->>'created_at')::timestamptz, c.created_at)
        FROM ai_conversations c, jsonb_array_elements(c.messages) AS msg
        WHERE jsonb_typeof(c.messages) = 'array'
          AND jsonb_array_length(c.messages) > 0
          AND NOT EXISTS (SELECT 1 FROM ai_messages WHERE conversation_id = c.id LIMIT 1);
    END IF;
END $$;


-- ===================== CONSTRAINTS =====================
DO $$
BEGIN
    -- Foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contact_requests_user_id_fkey') THEN
        ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contact_requests_assigned_to_fkey') THEN
        ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='consultation_bookings_user_id_fkey') THEN
        ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='consultation_bookings_service_id_fkey') THEN
        ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='consultation_bookings_assigned_to_fkey') THEN
        ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blog_posts_author_id_fkey') THEN
        ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ai_conversations_user_id_fkey') THEN
        ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ai_messages_conversation_id_fkey') THEN
        ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='notifications_user_id_fkey') THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    -- CHECK constraints (guarded)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_role_check') THEN
            ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('client','admin','consultant','subadmin','user','employer'));
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_messages' AND column_name='role') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ai_messages_role_check') THEN
            ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_role_check CHECK (role IN ('user','assistant','system'));
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='action') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audit_logs_action_check') THEN
            ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check CHECK (action IN ('INSERT','UPDATE','DELETE'));
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_requests' AND column_name='status') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contact_requests_status_check') THEN
            ALTER TABLE contact_requests ADD CONSTRAINT contact_requests_status_check CHECK (status IN ('new','pending','resolved','rejected'));
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='status') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='consultation_bookings_status_check') THEN
            ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_status_check CHECK (status IN ('pending','confirmed','completed','cancelled'));
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='notifications_type_check') THEN
            ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('info','warning','error','success','booking','contact','system'));
        END IF;
    END IF;
END $$;

-- ===================== INDEXES (optimized, no redundancy) =====================
-- Single-column
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_service_id ON consultation_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
-- Composite indexes (dashboard & filtering performance)
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_created ON contact_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_created ON consultation_bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_created ON audit_logs(table_name, created_at DESC);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_users_tenant_id') THEN
            EXECUTE 'CREATE INDEX idx_users_tenant_id ON users(tenant_id) WHERE tenant_id IS NOT NULL';
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_requests' AND column_name='tenant_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_contact_requests_tenant') THEN
            EXECUTE 'CREATE INDEX idx_contact_requests_tenant ON contact_requests(tenant_id) WHERE tenant_id IS NOT NULL';
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='tenant_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_consultation_bookings_tenant') THEN
            EXECUTE 'CREATE INDEX idx_consultation_bookings_tenant ON consultation_bookings(tenant_id) WHERE tenant_id IS NOT NULL';
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='tenant_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_ai_conversations_tenant') THEN
            EXECUTE 'CREATE INDEX idx_ai_conversations_tenant ON ai_conversations(tenant_id) WHERE tenant_id IS NOT NULL';
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='slug') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_blog_posts_slug') THEN
            EXECUTE 'CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts(slug) WHERE slug IS NOT NULL AND deleted_at IS NULL';
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_blog_posts_author') THEN
            EXECUTE 'CREATE INDEX idx_blog_posts_author ON blog_posts(author_id) WHERE deleted_at IS NULL';
        END IF;
    END IF;
END $$;

-- ===================== FUNCTIONS =====================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = auth.uid() AND is_active = true AND deleted_at IS NULL;
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_tenant_id() RETURNS UUID AS $$
DECLARE user_tenant UUID;
BEGIN
    SELECT tenant_id INTO user_tenant FROM users WHERE id = auth.uid();
    RETURN user_tenant;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'audit_logs' THEN RETURN COALESCE(NEW, OLD); END IF;
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION generate_slug_from_title() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
        NEW.slug := lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
        NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ===================== TRIGGERS =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_users_updated_at') THEN
        CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_contact_requests_updated_at') THEN
        CREATE TRIGGER trigger_contact_requests_updated_at BEFORE UPDATE ON contact_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_consultation_bookings_updated_at') THEN
        CREATE TRIGGER trigger_consultation_bookings_updated_at BEFORE UPDATE ON consultation_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_blog_posts_updated_at') THEN
        CREATE TRIGGER trigger_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_blog_posts_slug') THEN
        CREATE TRIGGER trigger_blog_posts_slug BEFORE INSERT ON blog_posts FOR EACH ROW EXECUTE FUNCTION generate_slug_from_title();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_ai_conversations_updated_at') THEN
        CREATE TRIGGER trigger_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trigger_services_updated_at') THEN
        CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_users_trigger') THEN
        CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_blog_posts_trigger') THEN
        CREATE TRIGGER audit_blog_posts_trigger AFTER INSERT OR UPDATE OR DELETE ON blog_posts FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_contact_requests_trigger') THEN
        CREATE TRIGGER audit_contact_requests_trigger AFTER INSERT OR UPDATE OR DELETE ON contact_requests FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_consultation_bookings_trigger') THEN
        CREATE TRIGGER audit_consultation_bookings_trigger AFTER INSERT OR UPDATE OR DELETE ON consultation_bookings FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    END IF;
END $$;

-- ===================== ENABLE RLS =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================== RLS POLICIES (tenant-aware) =====================
DO $$
BEGIN
    -- === USERS ===
    DROP POLICY IF EXISTS users_select_own ON users;
    CREATE POLICY users_select_own ON users FOR SELECT USING (
        (auth.uid() = id AND deleted_at IS NULL AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL))
        OR is_admin()
    );
    DROP POLICY IF EXISTS users_insert_auth ON users;
    CREATE POLICY users_insert_auth ON users FOR INSERT WITH CHECK (auth.uid() = id);
    DROP POLICY IF EXISTS users_update_own ON users;
    CREATE POLICY users_update_own ON users FOR UPDATE USING ((auth.uid() = id) OR is_admin());
    DROP POLICY IF EXISTS users_delete_admin ON users;
    CREATE POLICY users_delete_admin ON users FOR DELETE USING (is_admin());
    DROP POLICY IF EXISTS users_insert_authenticated ON users;

    -- === CONTACT REQUESTS (tenant-isolated) ===
    DROP POLICY IF EXISTS contact_requests_insert_all ON contact_requests;
    CREATE POLICY contact_requests_insert_all ON contact_requests FOR INSERT WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL OR is_admin()
    );
    DROP POLICY IF EXISTS contact_requests_insert_own ON contact_requests;
    DROP POLICY IF EXISTS contact_requests_select_own ON contact_requests;
    CREATE POLICY contact_requests_select_own ON contact_requests FOR SELECT USING (
        ((user_id = auth.uid() OR user_id IS NULL) AND deleted_at IS NULL AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL))
        OR is_admin()
    );
    DROP POLICY IF EXISTS contact_requests_update_own ON contact_requests;
    CREATE POLICY contact_requests_update_own ON contact_requests FOR UPDATE USING ((user_id = auth.uid()) OR is_admin());
    DROP POLICY IF EXISTS contact_requests_delete_admin ON contact_requests;
    CREATE POLICY contact_requests_delete_admin ON contact_requests FOR DELETE USING (is_admin());

    -- === CONSULTATION BOOKINGS (tenant-isolated) ===
    DROP POLICY IF EXISTS consultation_bookings_insert_all ON consultation_bookings;
    CREATE POLICY consultation_bookings_insert_all ON consultation_bookings FOR INSERT WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL OR is_admin()
    );
    DROP POLICY IF EXISTS consultation_bookings_insert_own ON consultation_bookings;
    DROP POLICY IF EXISTS consultation_bookings_select_own ON consultation_bookings;
    CREATE POLICY consultation_bookings_select_own ON consultation_bookings FOR SELECT USING (
        ((user_id = auth.uid() OR user_id IS NULL) AND deleted_at IS NULL AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL))
        OR is_admin()
    );
    DROP POLICY IF EXISTS consultation_bookings_update_own ON consultation_bookings;
    CREATE POLICY consultation_bookings_update_own ON consultation_bookings FOR UPDATE USING ((user_id = auth.uid()) OR is_admin());
    DROP POLICY IF EXISTS consultation_bookings_delete_admin ON consultation_bookings;
    CREATE POLICY consultation_bookings_delete_admin ON consultation_bookings FOR DELETE USING (is_admin());

    -- === BLOG POSTS ===
    DROP POLICY IF EXISTS blog_posts_select_all ON blog_posts;
    CREATE POLICY blog_posts_select_all ON blog_posts FOR SELECT USING ((is_published = true AND deleted_at IS NULL) OR is_admin());
    DROP POLICY IF EXISTS blog_posts_manage_admin ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_insert_admin ON blog_posts;
    CREATE POLICY blog_posts_insert_admin ON blog_posts FOR INSERT WITH CHECK (is_admin());
    DROP POLICY IF EXISTS blog_posts_update_admin ON blog_posts;
    CREATE POLICY blog_posts_update_admin ON blog_posts FOR UPDATE USING (is_admin());
    DROP POLICY IF EXISTS blog_posts_delete_admin ON blog_posts;
    CREATE POLICY blog_posts_delete_admin ON blog_posts FOR DELETE USING (is_admin());

    -- === AI CONVERSATIONS (tenant-isolated) ===
    DROP POLICY IF EXISTS ai_conversations_own ON ai_conversations;
    DROP POLICY IF EXISTS ai_conversations_select_own ON ai_conversations;
    CREATE POLICY ai_conversations_select_own ON ai_conversations FOR SELECT USING (
        (user_id = auth.uid() AND (tenant_id = get_user_tenant_id() OR tenant_id IS NULL))
        OR is_admin()
    );
    DROP POLICY IF EXISTS ai_conversations_insert_own ON ai_conversations;
    CREATE POLICY ai_conversations_insert_own ON ai_conversations FOR INSERT WITH CHECK (user_id = auth.uid());
    DROP POLICY IF EXISTS ai_conversations_update_own ON ai_conversations;
    CREATE POLICY ai_conversations_update_own ON ai_conversations FOR UPDATE USING (user_id = auth.uid() OR is_admin());
    DROP POLICY IF EXISTS ai_conversations_delete_own ON ai_conversations;
    CREATE POLICY ai_conversations_delete_own ON ai_conversations FOR DELETE USING (user_id = auth.uid() OR is_admin());

    -- === AI MESSAGES ===
    DROP POLICY IF EXISTS ai_messages_own ON ai_messages;
    DROP POLICY IF EXISTS ai_messages_select_own ON ai_messages;
    CREATE POLICY ai_messages_select_own ON ai_messages FOR SELECT USING (
        EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
        OR is_admin()
    );
    DROP POLICY IF EXISTS ai_messages_insert_own ON ai_messages;
    CREATE POLICY ai_messages_insert_own ON ai_messages FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
        OR is_admin()
    );
    DROP POLICY IF EXISTS ai_messages_update_admin ON ai_messages;
    CREATE POLICY ai_messages_update_admin ON ai_messages FOR UPDATE USING (is_admin());
    DROP POLICY IF EXISTS ai_messages_delete_admin ON ai_messages;
    CREATE POLICY ai_messages_delete_admin ON ai_messages FOR DELETE USING (is_admin());

    -- === SERVICES ===
    DROP POLICY IF EXISTS services_select_active ON services;
    DROP POLICY IF EXISTS services_select_all ON services;
    CREATE POLICY services_select_all ON services FOR SELECT USING (is_active = true OR is_admin());
    DROP POLICY IF EXISTS services_manage_admin ON services;
    DROP POLICY IF EXISTS services_insert_admin ON services;
    CREATE POLICY services_insert_admin ON services FOR INSERT WITH CHECK (is_admin());
    DROP POLICY IF EXISTS services_update_admin ON services;
    CREATE POLICY services_update_admin ON services FOR UPDATE USING (is_admin());
    DROP POLICY IF EXISTS services_delete_admin ON services;
    CREATE POLICY services_delete_admin ON services FOR DELETE USING (is_admin());

    -- === NOTIFICATIONS ===
    DROP POLICY IF EXISTS notifications_own ON notifications;
    DROP POLICY IF EXISTS notifications_select_own ON notifications;
    CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid() OR is_admin());
    DROP POLICY IF EXISTS notifications_insert_system ON notifications;
    CREATE POLICY notifications_insert_system ON notifications FOR INSERT WITH CHECK (is_admin());
    DROP POLICY IF EXISTS notifications_update_own ON notifications;
    CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid() OR is_admin());
    DROP POLICY IF EXISTS notifications_delete_own ON notifications;
    CREATE POLICY notifications_delete_own ON notifications FOR DELETE USING (user_id = auth.uid() OR is_admin());

    -- === AUDIT LOGS (immutable — admin read, system write only) ===
    DROP POLICY IF EXISTS audit_logs_admin_only ON audit_logs;
    DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;
    CREATE POLICY audit_logs_select_admin ON audit_logs FOR SELECT USING (is_admin());
    DROP POLICY IF EXISTS audit_logs_insert_system ON audit_logs;
    CREATE POLICY audit_logs_insert_system ON audit_logs FOR INSERT WITH CHECK (true);
    -- No UPDATE/DELETE policies = immutable audit trail
END $$;

-- ===================== MIGRATE service_type → service_id =====================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultation_bookings' AND column_name='service_type')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='services') THEN
        INSERT INTO services (name, description)
        SELECT DISTINCT service_type, 'Migrated from consultation bookings'
        FROM consultation_bookings
        WHERE service_type IS NOT NULL AND service_type != ''
        AND NOT EXISTS (SELECT 1 FROM services WHERE name = consultation_bookings.service_type)
        ON CONFLICT (name) DO NOTHING;

        UPDATE consultation_bookings cb SET service_id = s.id
        FROM services s
        WHERE cb.service_type = s.name AND cb.service_id IS NULL
        AND cb.service_type IS NOT NULL AND cb.service_type != '';
    END IF;
END $$;

-- ===================== SEED DATA =====================
INSERT INTO blog_posts (title, excerpt, content, author, category, image_url)
SELECT * FROM (VALUES
    ('كيف تبني استراتيجية عمل ناجحة في 2026', 'دليل شامل لبناء استراتيجية عمل قوية تساعدك على تحقيق أهدافك وتجاوز المنافسين', 'في عالم الأعمال المتغير باستمرار، تعد الاستراتيجية الواضحة والمدروسة هي مفتاح النجاح. في هذا المقال، سنستعرض الخطوات الأساسية لبناء استراتيجية عمل ناجحة تتضمن تحليل السوق، تحديد الأهداف الذكية، وبناء خطة تنفيذية قابلة للقياس.', 'فريق SCK', 'استراتيجية', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop'),
    ('أهمية الموارد البشرية في نجاح الشركات', 'كيف يمكن لإدارة الموارد البشرية الفعالة أن تحدث فرقاً كبيراً في أداء شركتك', 'الموارد البشرية هي العمود الفقري لأي منظمة ناجحة. في هذا المقال، نستكشف كيف يمكن لاستراتيجية موارد بشرية قوية أن تحول أداء شركتك من خلال التوظيف الذكي، تطوير المواهب، وبناء ثقافة عمل محفزة.', 'فريق SCK', 'موارد بشرية', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop'),
    ('التحول الرقمي: ضرورة أم خيار؟', 'لماذا أصبح التحول الرقمي ضرورة حتمية للشركات في العصر الحديث', 'في عصر التكنولوجيا المتسارع، لم يعد التحول الرقمي خياراً بل ضرورة للبقاء والمنافسة. نستعرض في هذا المقال أهمية التحول الرقمي وكيفية تطبيقه بنجاح في شركتك.', 'فريق SCK', 'تكنولوجيا', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

-- ===================== CLEANUP: drop deprecated columns safely =====================
-- These run last so all data has been migrated first
DO $$
BEGIN
    -- ai_conversations.messages is now redundant (data lives in ai_messages)
    -- Only drop if all data was migrated successfully
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_conversations' AND column_name='messages') THEN
        -- Verify migration is complete before dropping
        IF NOT EXISTS (
            SELECT 1 FROM ai_conversations c
            WHERE jsonb_typeof(c.messages) = 'array' AND jsonb_array_length(c.messages) > 0
            AND NOT EXISTS (SELECT 1 FROM ai_messages WHERE conversation_id = c.id)
        ) THEN
            ALTER TABLE ai_conversations DROP COLUMN messages;
        END IF;
    END IF;
END $$;
