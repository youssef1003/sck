# 🚀 SCK Consulting Platform

A modern, full-stack consulting platform with AI-powered chatbot, built with React, Node.js, and Supabase.

[![Status](https://img.shields.io/badge/status-production-success)](https://github.com)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-18+-green)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange)](https://supabase.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [RAG AI Chatbot](#-rag-ai-chatbot)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🏠 **Modern Landing Page** - Hero, services, testimonials, stats
- 📝 **Blog System** - Create, edit, publish blog posts
- 💼 **Services Management** - Showcase consulting services
- 📞 **Contact Forms** - Handle client inquiries
- 📅 **Booking System** - Schedule consultations
- 👥 **User Management** - Authentication and authorization
- 🔐 **Admin Dashboard** - Complete admin panel

### AI Features (NEW!)
- 🤖 **RAG Chatbot** - AI assistant powered by Grok API
- 🔍 **Vector Search** - Semantic search with pgvector
- 🌍 **Bilingual Support** - English and Arabic
- 💬 **Conversation Memory** - Context-aware responses
- 📚 **Knowledge Base** - Answers from your custom data
- 🎯 **No Hallucination** - Grounded in facts only

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **i18next** - Internationalization
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Vercel Serverless** - API functions
- **Supabase** - Database & Auth
- **PostgreSQL** - Database
- **pgvector** - Vector similarity search

### AI & ML
- **Grok API** - LLM for chat responses
- **OpenAI Embeddings** - Text embeddings (ada-002)
- **RAG Pipeline** - Retrieval-Augmented Generation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account
- OpenAI API key (for embeddings)
- Grok API key (for chat)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd sck-consulting
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Setup Environment Variables

Create `.env` file in root:

```env
# Supabase
SUPABASE_URL=https://kvngmywqilwhyavyjpc.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# AI APIs (for RAG chatbot)
OPENAI_API_KEY=sk-your-openai-key
GROK_API_KEY=xai-your-grok-key
GROK_API_URL=https://api.x.ai/v1/chat/completions

# Environment
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://kvngmywqilwhyavyjpc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Setup Database

Run the database schema in Supabase SQL Editor:

```bash
# Copy contents of DATABASE_RAG_SCHEMA.sql
# Paste in Supabase Dashboard → SQL Editor → Run
```

### 5. Ingest Content (for AI Chatbot)

```bash
# Ingest existing blog posts and services
node scripts/ingest-existing-content.js
```

### 6. Run Development Servers

```bash
# Terminal 1: Run backend
npm run dev
# Backend runs at http://localhost:3000

# Terminal 2: Run frontend
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

### 7. Open Browser

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
sck-consulting/
├── api/                          # Backend API endpoints
│   ├── auth/                     # Authentication
│   │   ├── login.js
│   │   ├── me.js
│   │   └── refresh.js
│   ├── admin/                    # Admin endpoints
│   │   ├── backup.js
│   │   ├── manage.js
│   │   ├── stats.js
│   │   └── users.js
│   ├── rag/                      # AI Chatbot (NEW!)
│   │   ├── chat.js               # Chat endpoint
│   │   └── ingest.js             # Document ingestion
│   ├── bookings.js
│   ├── contact.js
│   ├── health.js
│   └── upload.js
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── admin/            # Admin components
│   │   │   ├── home/             # Home page sections
│   │   │   ├── RAGChat.jsx       # AI Chat interface (NEW!)
│   │   │   ├── RAGChatWidget.jsx # Floating chat button (NEW!)
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Blog.jsx
│   │   │   └── admin/            # Admin pages
│   │   ├── i18n/                 # Translations
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── ar.json
│   │   ├── utils/                # Utilities
│   │   │   ├── api.js
│   │   │   └── adminApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── scripts/                      # Utility scripts
│   ├── ingest-existing-content.js  # Bulk content ingestion
│   ├── ingest-pdf.js               # PDF ingestion
│   └── test-rag-system.js          # Test AI chatbot
│
├── DATABASE_RAG_SCHEMA.sql       # Database schema
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json
├── vercel.json                   # Vercel config
└── README.md                     # This file
```

---

## 🤖 RAG AI Chatbot

### What is RAG?

**RAG (Retrieval-Augmented Generation)** combines:
1. **Retrieval**: Finding relevant information from your knowledge base
2. **Generation**: Creating natural language responses using AI

### How It Works

```
User Question
    ↓
Generate Embedding (OpenAI)
    ↓
Search Similar Documents (pgvector)
    ↓
Build Context from Top Results
    ↓
Send to Grok API with Context
    ↓
Return Accurate Answer
    ↓
Save Conversation
```

### Features

- ✅ **Accurate**: Answers only from your knowledge base
- ✅ **Bilingual**: English and Arabic support
- ✅ **Fast**: < 3 second response time
- ✅ **Secure**: User isolation with RLS
- ✅ **Conversational**: Remembers context
- ✅ **Source Attribution**: Shows where answers come from

### Integration

Add the floating chat widget to your app:

```jsx
// In App.jsx
import RAGChatWidget from './components/RAGChatWidget'

function App() {
  const userId = getCurrentUserId() // Your auth logic
  
  return (
    <>
      {/* Your app content */}
      <RAGChatWidget userId={userId} />
    </>
  )
}
```

### Documentation

For detailed RAG system documentation, see:
- `RAG_QUICK_START.md` - 5-minute setup guide
- `RAG_SYSTEM_DOCUMENTATION.md` - Complete technical docs
- `RAG_INTEGRATION_GUIDE.md` - Integration examples
- `RAG_ARCHITECTURE.md` - System architecture

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

### Authentication Endpoints

#### POST `/api/auth/login`
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### GET `/api/auth/me`
Get current user

**Headers:**
```
Authorization: Bearer <token>
```

### RAG Chatbot Endpoints

#### POST `/api/rag/chat`
Chat with AI assistant

**Request:**
```json
{
  "message": "What services do you offer?",
  "conversationId": "uuid-optional",
  "language": "en",
  "userId": "uuid-optional"
}
```

**Response:**
```json
{
  "success": true,
  "response": "We offer consulting services including...",
  "conversationId": "uuid",
  "contextUsed": 5,
  "sources": [
    {
      "type": "service",
      "id": "service-123",
      "similarity": 0.89
    }
  ]
}
```

#### POST `/api/rag/ingest`
Ingest documents into knowledge base (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "content": "Document text here...",
  "metadata": {
    "sourceType": "blog",
    "sourceId": "blog-123",
    "language": "en",
    "title": "Document Title"
  }
}
```

### Other Endpoints

- `POST /api/bookings` - Create consultation booking
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check
- `POST /api/upload` - Upload files

---

## 🚀 Deployment

### Deploy to Vercel

#### Backend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
vercel --prod
```

#### Frontend

```bash
cd frontend
npm run build
vercel --prod
```

#### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `GROK_API_KEY`
- `GROK_API_URL`
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_URL` (your backend URL)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes | `eyJhbG...` |
| `JWT_SECRET` | JWT signing secret | Yes | `your-secret-key` |
| `OPENAI_API_KEY` | OpenAI API key (for embeddings) | Yes* | `sk-...` |
| `GROK_API_KEY` | Grok API key (for chat) | Yes* | `xai-...` |
| `GROK_API_URL` | Grok API endpoint | Yes* | `https://api.x.ai/v1/chat/completions` |
| `NODE_ENV` | Environment | No | `development` or `production` |

*Required only if using RAG chatbot

### Frontend (frontend/.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:3000` |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJhbG...` |

---

## 📜 Scripts

### Backend Scripts

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build (no build needed for serverless)
npm run build
```

### Frontend Scripts

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### RAG System Scripts

```bash
# Ingest existing content (blogs, services)
node scripts/ingest-existing-content.js

# Ingest PDF documents
node scripts/ingest-pdf.js ./document.pdf

# Test RAG system
node scripts/test-rag-system.js
```

---

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'
```

### Test Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

### Run Automated Tests

```bash
# Test RAG system
node scripts/test-rag-system.js
```

---

## 🔧 Configuration

### Adjust RAG Parameters

Edit `api/rag/chat.js`:

```javascript
const CONFIG = {
  TOP_K_RESULTS: 5,              // Documents to retrieve
  SIMILARITY_THRESHOLD: 0.7,     // Min similarity (0-1)
  MAX_CONVERSATION_HISTORY: 10,  // Messages to remember
  GROK_MODEL: 'grok-beta'        // LLM model
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

## 🐛 Troubleshooting

### Backend Issues

**Issue: "Module not found: axios"**
```bash
npm install axios
```

**Issue: "vercel: command not found"**
```bash
npm install -g vercel
```

**Issue: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
vercel dev --listen 3001
```

### RAG Chatbot Issues

**Issue: No results found**
- Lower `SIMILARITY_THRESHOLD` to 0.6 in `api/rag/chat.js`

**Issue: Embedding generation fails**
- Check `OPENAI_API_KEY` is correct
- Verify OpenAI account has credits

**Issue: Grok API timeout**
- Check `GROK_API_KEY` is correct
- Increase timeout in `api/rag/chat.js`

**Issue: RLS policy blocking**
- Verify user is authenticated
- Check RLS policies in Supabase

---

## 📊 Database Schema

### Main Tables

- `users` - User accounts
- `blog_posts` - Blog content
- `services` - Service offerings
- `contact_requests` - Contact form submissions
- `consultation_bookings` - Booking requests
- `admin_permissions` - Admin roles

### RAG System Tables (NEW!)

- `rag_documents` - Knowledge base with vector embeddings
- `chat_conversations` - User conversations
- `chat_messages` - Individual messages
- `rag_ingestion_jobs` - Document processing tracking

---

## 🎯 Features Roadmap

### Completed ✅
- [x] Landing page
- [x] Blog system
- [x] Services management
- [x] Contact forms
- [x] Booking system
- [x] Admin dashboard
- [x] User authentication
- [x] RAG AI chatbot
- [x] Bilingual support
- [x] Vector search

### Planned 🚧
- [ ] Streaming chat responses
- [ ] Query caching
- [ ] Analytics dashboard
- [ ] Feedback system
- [ ] Voice input/output
- [ ] Multi-modal support (images)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

**SCK Consulting** - Building the future of consulting

---

## 📞 Support

Need help? Check the documentation:

- `RAG_QUICK_START.md` - Quick setup guide
- `RAG_SYSTEM_DOCUMENTATION.md` - Technical docs
- `RAG_INTEGRATION_GUIDE.md` - Integration help

---

## 🙏 Acknowledgments

**Technologies:**
- React & Vite
- Supabase & PostgreSQL
- OpenAI & Grok API
- Tailwind CSS
- Vercel

**Special Thanks:**
- pgvector for vector similarity search
- OpenAI for embeddings
- X.AI for Grok API

---

## 📈 Stats

![GitHub last commit](https://img.shields.io/github/last-commit/your-repo)
![GitHub issues](https://img.shields.io/github/issues/your-repo)
![GitHub stars](https://img.shields.io/github/stars/your-repo)

---

**Built with ❤️ by SCK Consulting Team**

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: April 2026

---

## 🚀 Quick Commands Reference

```bash
# Setup
npm install && cd frontend && npm install && cd ..

# Run backend
npm run dev

# Run frontend
cd frontend && npm run dev

# Ingest content
node scripts/ingest-existing-content.js

# Test
node scripts/test-rag-system.js

# Deploy
vercel --prod
```

---

**Ready to build something amazing?** 🚀✨
