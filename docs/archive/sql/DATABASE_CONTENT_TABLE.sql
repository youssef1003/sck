-- Create Page Content Table for storing managed content
CREATE TABLE IF NOT EXISTS page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key VARCHAR(50) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_content_key ON page_content(page_key);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_page_content_updated_at ON page_content;
CREATE TRIGGER trigger_page_content_updated_at 
    BEFORE UPDATE ON page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role has full access" ON page_content
FOR ALL USING (auth.role() = 'service_role');

-- Insert default content for pages
INSERT INTO page_content (page_key, content) VALUES
('home', '{}'::jsonb),
('services', '{"services": []}'::jsonb),
('about', '{}'::jsonb),
('contact', '{}'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

SELECT 'Page content table created successfully!' AS result;
