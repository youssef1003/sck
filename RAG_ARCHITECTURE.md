# 🏗️ RAG SYSTEM ARCHITECTURE

## 📐 SYSTEM DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RAGChatWidget.jsx (Floating Button)                     │  │
│  │  └─> RAGChat.jsx (Chat Interface)                        │  │
│  │      - Message Display                                    │  │
│  │      - Input Field                                        │  │
│  │      - Loading States                                     │  │
│  │      - Error Handling                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/rag/chat (Main Endpoint)                           │  │
│  │  ├─> Validate Input                                      │  │
│  │  ├─> Generate Query Embedding                            │  │
│  │  ├─> Vector Search                                       │  │
│  │  ├─> Build Context                                       │  │
│  │  ├─> Call Grok API                                       │  │
│  │  └─> Save & Return Response                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/rag/ingest (Document Ingestion)                    │  │
│  │  ├─> Chunk Text                                          │  │
│  │  ├─> Generate Embeddings (Batch)                         │  │
│  │  ├─> Store in Database                                   │  │
│  │  └─> Track Job Status                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   OPENAI API             │  │   GROK API               │
│   (Embeddings)           │  │   (LLM Generation)       │
│                          │  │                          │
│  text-embedding-ada-002  │  │  grok-beta               │
│  → vector(1536)          │  │  → Natural Language      │
└──────────────────────────┘  └──────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  rag_documents (Knowledge Base)                          │  │
│  │  ├─ id (UUID)                                            │  │
│  │  ├─ content (TEXT)                                       │  │
│  │  ├─ embedding (vector(1536)) ← HNSW Index               │  │
│  │  ├─ metadata (JSONB)                                     │  │
│  │  ├─ source_type, source_id                              │  │
│  │  ├─ language (en/ar)                                     │  │
│  │  └─ tenant_id (multi-tenant)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  chat_conversations                                      │  │
│  │  ├─ id, user_id, title, language                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  chat_messages                                           │  │
│  │  ├─ conversation_id, role, content                      │  │
│  │  └─ context_used (retrieved chunks)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Functions                                               │  │
│  │  ├─ search_similar_documents() ← Vector Search          │  │
│  │  ├─ get_conversation_context()                          │  │
│  │  └─ cleanup_old_conversations()                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW

### 1. CHAT FLOW (User Query → AI Response)

```
User Types Message
    │
    ▼
Frontend Validation
    │
    ▼
POST /api/rag/chat
    │
    ├─> Generate Embedding (OpenAI)
    │   Input: "What services do you offer?"
    │   Output: [0.123, -0.456, ..., 0.789] (1536 dimensions)
    │
    ├─> Vector Search (Supabase)
    │   Function: search_similar_documents()
    │   Method: Cosine Similarity
    │   Returns: Top 5 most similar documents
    │   Example:
    │   [
    │     { content: "We offer consulting...", similarity: 0.89 },
    │     { content: "Our services include...", similarity: 0.85 },
    │     ...
    │   ]
    │
    ├─> Get Conversation History
    │   Last 10 messages for context
    │
    ├─> Build Prompt
    │   System: "You are an assistant. Answer from context only."
    │   Context: [Retrieved documents]
    │   History: [Previous messages]
    │   User: "What services do you offer?"
    │
    ├─> Call Grok API
    │   Model: grok-beta
    │   Temperature: 0.7
    │   Max Tokens: 1000
    │   Returns: "We offer consulting services including..."
    │
    ├─> Save Messages
    │   User message → chat_messages
    │   AI response → chat_messages
    │   Context used → metadata
    │
    └─> Return Response
        {
          success: true,
          response: "We offer...",
          conversationId: "uuid",
          contextUsed: 5,
          sources: [...]
        }
```

### 2. INGESTION FLOW (Document → Knowledge Base)

```
Document Input (PDF, Text, Blog, etc.)
    │
    ▼
POST /api/rag/ingest
    │
    ├─> Create Ingestion Job
    │   Status: "processing"
    │
    ├─> Text Chunking
    │   Algorithm: Sentence-aware splitting
    │   Max Size: 800 characters
    │   Overlap: 100 characters
    │   Example:
    │   Input: "Long document text..."
    │   Output: [
    │     "Chunk 1: First part...",
    │     "Chunk 2: ...overlap...second part...",
    │     "Chunk 3: ...overlap...third part..."
    │   ]
    │
    ├─> Generate Embeddings (Batch)
    │   OpenAI API: text-embedding-ada-002
    │   Input: ["Chunk 1", "Chunk 2", "Chunk 3"]
    │   Output: [
    │     [0.1, 0.2, ..., 0.3],  // 1536 dimensions
    │     [0.4, 0.5, ..., 0.6],
    │     [0.7, 0.8, ..., 0.9]
    │   ]
    │
    ├─> Store in Database
    │   Table: rag_documents
    │   Rows: One per chunk
    │   Fields: content, embedding, metadata, source_type, etc.
    │
    └─> Update Job Status
        Status: "completed"
        Processed: 3/3 chunks
```

---

## 🧩 COMPONENT BREAKDOWN

### Frontend Components

```
RAGChatWidget.jsx
├─ Purpose: Floating chat button + window container
├─ State: isOpen (boolean)
├─ Features:
│  ├─ Floating button (bottom-right)
│  ├─ Smooth animations
│  ├─ Online indicator
│  └─ Responsive design
└─ Renders: <RAGChat /> when open

RAGChat.jsx
├─ Purpose: Main chat interface
├─ State:
│  ├─ messages (array)
│  ├─ input (string)
│  ├─ loading (boolean)
│  ├─ conversationId (uuid)
│  └─ error (string)
├─ Features:
│  ├─ Message display (user/assistant)
│  ├─ Auto-scroll
│  ├─ Typing indicator
│  ├─ Error handling
│  ├─ Source attribution
│  └─ Bilingual support
└─ API Calls: POST /api/rag/chat
```

### Backend APIs

```
/api/rag/chat.js
├─ Method: POST
├─ Auth: Optional (better with userId)
├─ Input:
│  ├─ message (required)
│  ├─ conversationId (optional)
│  ├─ language (default: 'en')
│  └─ userId (optional)
├─ Functions:
│  ├─ generateEmbedding()
│  ├─ searchSimilarDocuments()
│  ├─ getConversationHistory()
│  ├─ buildContextPrompt()
│  ├─ callGrokAPI()
│  └─ saveMessage()
└─ Output:
   ├─ success (boolean)
   ├─ response (string)
   ├─ conversationId (uuid)
   ├─ contextUsed (number)
   └─ sources (array)

/api/rag/ingest.js
├─ Method: POST
├─ Auth: Required (admin only)
├─ Input:
│  ├─ content (required)
│  └─ metadata (optional)
├─ Functions:
│  ├─ chunkText()
│  ├─ generateEmbedding()
│  ├─ batchGenerateEmbeddings()
│  └─ ingestDocument()
└─ Output:
   ├─ success (boolean)
   ├─ jobId (uuid)
   ├─ chunksProcessed (number)
   └─ totalChunks (number)
```

### Database Functions

```
search_similar_documents()
├─ Purpose: Vector similarity search
├─ Algorithm: Cosine similarity (pgvector)
├─ Index: HNSW (fast approximate search)
├─ Parameters:
│  ├─ query_embedding (vector)
│  ├─ match_threshold (float, default 0.7)
│  ├─ match_count (int, default 5)
│  ├─ filter_language (varchar, optional)
│  └─ filter_tenant_id (uuid, optional)
└─ Returns: Top-K similar documents with scores

get_conversation_context()
├─ Purpose: Retrieve recent messages
├─ Parameters:
│  ├─ conv_id (uuid)
│  └─ message_limit (int, default 10)
└─ Returns: Last N messages ordered by time

cleanup_old_conversations()
├─ Purpose: Delete old conversations
├─ Parameters:
│  └─ days_old (int, default 90)
└─ Returns: Number of deleted conversations
```

---

## 🔐 SECURITY ARCHITECTURE

### Row-Level Security (RLS)

```
rag_documents
├─ SELECT: Public (everyone can read)
└─ INSERT/UPDATE/DELETE: Admin only

chat_conversations
├─ SELECT: Own conversations only (user_id = auth.uid())
└─ INSERT: Own conversations only

chat_messages
├─ SELECT: Own messages only (via conversation ownership)
└─ INSERT: Own messages only
```

### Authentication Flow

```
User Request
    │
    ▼
Frontend: Include Authorization header
    │
    ▼
Backend: Verify JWT token
    │
    ├─> Valid: Extract user_id
    │   └─> Apply RLS policies
    │
    └─> Invalid: Return 401 Unauthorized
```

### Data Isolation

```
Multi-Tenant Support:
├─ tenant_id field in rag_documents
├─ Filter by tenant_id in vector search
└─ Prevent cross-tenant data leakage

User Isolation:
├─ user_id in chat_conversations
├─ RLS policies enforce ownership
└─ No access to other users' chats
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. Vector Search Optimization

```
HNSW Index (Hierarchical Navigable Small World)
├─ Type: Approximate Nearest Neighbor (ANN)
├─ Speed: O(log n) vs O(n) for exact search
├─ Accuracy: 95%+ with proper parameters
└─ Trade-off: Slight accuracy loss for massive speed gain

Example:
├─ 10,000 documents
├─ Exact search: ~500ms
└─ HNSW search: ~50ms (10x faster)
```

### 2. Embedding Generation

```
Batch Processing:
├─ Single request: 1 chunk = 1 API call = 200ms
├─ Batch request: 10 chunks = 1 API call = 300ms
└─ Savings: 2000ms → 300ms (6.7x faster)

Caching (Future Enhancement):
├─ Cache embeddings for common queries
├─ Redis or in-memory cache
└─ Hit rate: 30-40% for typical usage
```

### 3. Database Queries

```
Indexes:
├─ Vector index (HNSW): Fast similarity search
├─ B-tree indexes: Fast filtering (tenant_id, language)
└─ Composite indexes: Multi-column queries

Connection Pooling:
├─ Supabase handles automatically
└─ Reuse connections for better performance
```

### 4. API Optimization

```
Timeouts:
├─ Embedding API: 10s
├─ Grok API: 30s
└─ Total request: <35s

Retries:
├─ Exponential backoff
├─ Max 3 retries
└─ Fail gracefully

Rate Limiting:
├─ Detect 429 errors
├─ Queue requests
└─ Inform user
```

---

## 📊 SCALABILITY

### Current Capacity

```
Documents:
├─ Storage: Unlimited (PostgreSQL)
├─ Vector search: Efficient up to 1M+ documents
└─ Recommended: 100K documents per tenant

Concurrent Users:
├─ API: Serverless (auto-scales)
├─ Database: Supabase (scales with plan)
└─ Bottleneck: External APIs (OpenAI, Grok)

Requests per Second:
├─ Chat: 10-100 RPS (depends on API limits)
├─ Ingestion: 1-10 RPS (embedding generation)
└─ Search: 100+ RPS (database only)
```

### Scaling Strategies

```
Horizontal Scaling:
├─ API: Serverless functions (auto-scale)
├─ Database: Read replicas for search
└─ Cache: Redis for embeddings

Vertical Scaling:
├─ Database: Upgrade Supabase plan
├─ Increase connection pool
└─ More powerful instance

Optimization:
├─ Reduce embedding dimensions (1536 → 768)
├─ Use smaller LLM for simple queries
└─ Implement query caching
```

---

## 🎯 DESIGN DECISIONS

### Why pgvector?
✅ Native PostgreSQL extension  
✅ No separate vector database needed  
✅ ACID compliance  
✅ Familiar SQL interface  
✅ Excellent performance with HNSW  

### Why OpenAI Embeddings?
✅ High quality (state-of-the-art)  
✅ 1536 dimensions (good balance)  
✅ Multilingual support  
✅ Stable API  

### Why Grok API?
✅ Fast inference  
✅ Good reasoning  
✅ Cost-effective  
✅ Easy to swap with other LLMs  

### Why Chunking?
✅ Better retrieval accuracy  
✅ Fits in context window  
✅ Reduces noise  
✅ Improves relevance  

### Why Conversation History?
✅ Context-aware responses  
✅ Better user experience  
✅ Follow-up questions work  
✅ Natural conversation flow  

---

## 🔄 FUTURE ENHANCEMENTS

### Phase 2 (Optional)
- [ ] Streaming responses (SSE)
- [ ] Query caching (Redis)
- [ ] Advanced analytics dashboard
- [ ] A/B testing for prompts
- [ ] Feedback loop (thumbs up/down)

### Phase 3 (Advanced)
- [ ] Multi-modal support (images)
- [ ] Voice input/output
- [ ] Custom fine-tuned embeddings
- [ ] Hybrid search (keyword + vector)
- [ ] Auto-reranking results

---

## ✅ PRODUCTION CHECKLIST

- [x] Database schema with indexes
- [x] Vector search function
- [x] RLS policies
- [x] Chat API with error handling
- [x] Ingestion API with chunking
- [x] Batch embedding generation
- [x] Conversation history
- [x] Bilingual support (EN/AR)
- [x] Frontend chat component
- [x] Floating chat widget
- [x] Source attribution
- [x] Job tracking
- [x] Ingestion scripts
- [x] Test scripts
- [x] Documentation
- [x] Quick start guide

---

**System Status: ✅ PRODUCTION READY**

منغير ماتبوظ حاجه! 🚀
