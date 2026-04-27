# 🚀 RAG SYSTEM - QUICK START GUIDE

## ⚡ 5-MINUTE SETUP

### Step 1: Database Setup (2 minutes)

```bash
# Option A: Using Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of DATABASE_RAG_SCHEMA.sql
3. Paste and click "Run"
4. Wait for "Success" message

# Option B: Using psql
psql -h your-supabase-host -U postgres -d postgres -f DATABASE_RAG_SCHEMA.sql
```

### Step 2: Environment Variables (1 minute)

Create `.env` file in root:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret

# Get these API keys:
OPENAI_API_KEY=sk-...          # https://platform.openai.com/api-keys
GROK_API_KEY=xai-...           # https://console.x.ai/
GROK_API_URL=https://api.x.ai/v1/chat/completions
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### Step 3: Install Dependencies (1 minute)

```bash
# Backend (if needed)
npm install @supabase/supabase-js axios

# Frontend
cd frontend
npm install lucide-react
```

### Step 4: Ingest Content (1 minute)

```bash
# Ingest existing blog posts and services
node scripts/ingest-existing-content.js
```

### Step 5: Test It! (30 seconds)

```bash
# Start backend (if local)
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev

# Open browser: http://localhost:5173
# Click the chat button (bottom-right)
# Ask: "What services do you offer?"
```

---

## 🎯 INTEGRATION GUIDE

### Add Chat Widget to Your App

```jsx
// In your main App.jsx or Layout component
import RAGChatWidget from './components/RAGChatWidget'

function App() {
  // Get current user ID from your auth system
  const userId = useAuth().user?.id
  
  return (
    <div>
      {/* Your existing app content */}
      <YourRoutes />
      <YourComponents />
      
      {/* Add chat widget - that's it! */}
      <RAGChatWidget userId={userId} />
    </div>
  )
}
```

### Add Full-Page Chat

```jsx
// Create a new route/page
import RAGChat from './components/RAGChat'

function ChatPage() {
  const userId = useAuth().user?.id
  
  return (
    <div className="h-screen">
      <RAGChat userId={userId} />
    </div>
  )
}
```

---

## 📝 COMMON TASKS

### Ingest a New Document

```javascript
// Using the API
const response = await fetch('/api/rag/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    content: 'Your document text here...',
    metadata: {
      sourceType: 'pdf',
      sourceId: 'doc-123',
      language: 'en',
      title: 'Document Title'
    }
  })
})
```

### Ingest a PDF

```bash
# Install pdf-parse first
npm install pdf-parse

# Ingest single PDF
node scripts/ingest-pdf.js ./documents/manual.pdf --language=en

# Ingest all PDFs in a folder
node scripts/ingest-pdf.js ./documents/ --language=ar
```

### Test the System

```bash
# Run automated tests
node scripts/test-rag-system.js
```

### Query the Database

```sql
-- See all documents
SELECT id, source_type, language, chunk_index, 
       LEFT(content, 100) as preview
FROM rag_documents
ORDER BY created_at DESC
LIMIT 10;

-- See conversations
SELECT c.id, c.title, c.language, 
       COUNT(m.id) as message_count
FROM chat_conversations c
LEFT JOIN chat_messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC;

-- Search similar documents manually
SELECT id, content, 
       1 - (embedding <=> '[your-embedding-vector]'::vector) as similarity
FROM rag_documents
ORDER BY embedding <=> '[your-embedding-vector]'::vector
LIMIT 5;
```

---

## 🔧 CONFIGURATION

### Adjust RAG Parameters

Edit `api/rag/chat.js`:

```javascript
const CONFIG = {
  MAX_CONTEXT_TOKENS: 3000,      // Max context size
  TOP_K_RESULTS: 5,              // Number of documents to retrieve
  SIMILARITY_THRESHOLD: 0.7,     // Min similarity (0-1)
  MAX_CONVERSATION_HISTORY: 10,  // Messages to remember
  GROK_MODEL: 'grok-beta',       // Grok model
  EMBEDDING_MODEL: 'text-embedding-ada-002'
}
```

### Adjust Chunking

Edit `api/rag/ingest.js`:

```javascript
const CHUNK_CONFIG = {
  MAX_CHUNK_SIZE: 800,    // Characters per chunk
  OVERLAP_SIZE: 100,      // Overlap between chunks
  MIN_CHUNK_SIZE: 100     // Minimum chunk size
}
```

---

## 🐛 TROUBLESHOOTING

### "No results found"
**Problem**: Similarity threshold too high  
**Solution**: Lower `SIMILARITY_THRESHOLD` to 0.6 or 0.5

### "Embedding generation failed"
**Problem**: Invalid OpenAI API key  
**Solution**: Check `OPENAI_API_KEY` in `.env`

### "Grok API timeout"
**Problem**: Slow API response  
**Solution**: Increase timeout in `api/rag/chat.js` (line with `timeout: 30000`)

### "RLS policy violation"
**Problem**: User not authenticated  
**Solution**: Ensure `userId` is passed to chat component

### Chat button not showing
**Problem**: Component not imported  
**Solution**: Check `RAGChatWidget` is imported and rendered

---

## 📊 MONITORING

### Check System Health

```sql
-- Document count by type
SELECT source_type, language, COUNT(*) as count
FROM rag_documents
GROUP BY source_type, language;

-- Recent conversations
SELECT COUNT(*) as total_conversations,
       COUNT(DISTINCT user_id) as unique_users
FROM chat_conversations
WHERE created_at > NOW() - INTERVAL '7 days';

-- Average response quality (by similarity)
SELECT AVG((context_used->>'similarity')::float) as avg_similarity
FROM chat_messages
WHERE context_used IS NOT NULL;

-- Ingestion job status
SELECT status, COUNT(*) as count
FROM rag_ingestion_jobs
GROUP BY status;
```

### Performance Metrics

- **Target Response Time**: < 3 seconds
- **Embedding Generation**: < 500ms
- **Vector Search**: < 100ms
- **Grok API**: < 2 seconds

---

## 🎨 CUSTOMIZATION

### Change Chat UI Colors

Edit `frontend/src/components/RAGChat.jsx`:

```jsx
// Change gradient colors
className="bg-gradient-to-r from-blue-600 to-purple-600"
// To:
className="bg-gradient-to-r from-green-600 to-teal-600"
```

### Change System Prompt

Edit `api/rag/chat.js`:

```javascript
const systemPrompt = language === 'ar'
  ? `أنت مساعد ذكي... [your custom prompt]`
  : `You are an intelligent assistant... [your custom prompt]`
```

### Add More Languages

1. Add language to database schema
2. Update language detection in `api/rag/chat.js`
3. Add translations to frontend components

---

## 📦 DEPLOYMENT

### Vercel (Recommended)

```bash
# Deploy backend
vercel --prod

# Deploy frontend
cd frontend
npm run build
vercel --prod
```

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `GROK_API_KEY`
- `GROK_API_URL`

---

## ✅ CHECKLIST

Before going live:

- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] Content ingested (blogs, services, etc.)
- [ ] Chat widget added to frontend
- [ ] Tested in both English and Arabic
- [ ] Verified no hallucination
- [ ] Checked response times
- [ ] Tested error handling
- [ ] Deployed to production
- [ ] Monitored for 24 hours

---

## 🆘 SUPPORT

### Common Questions

**Q: Can I use a different LLM instead of Grok?**  
A: Yes! Edit `api/rag/chat.js` and change the `callGrokAPI` function to call your preferred LLM (OpenAI, Anthropic, etc.)

**Q: Can I use a different embedding model?**  
A: Yes! Change `EMBEDDING_MODEL` in config. Note: Vector dimension must match (1536 for ada-002)

**Q: How do I delete old conversations?**  
A: Run: `SELECT cleanup_old_conversations(90);` (deletes conversations older than 90 days)

**Q: Can I add file upload to chat?**  
A: Yes! Add file upload to `RAGChat.jsx` and process with `ingest.js`

**Q: How do I backup the knowledge base?**  
A: Export: `COPY rag_documents TO '/tmp/rag_backup.csv' CSV HEADER;`

---

## 🎉 YOU'RE DONE!

Your RAG system is ready to use. Start chatting! 🚀

**Need help?** Check `RAG_SYSTEM_DOCUMENTATION.md` for detailed docs.
