# 🌐 SCK - Smart Consulting Platform

> **Empowering Businesses in Egypt 🇪🇬 & Saudi Arabia 🇸🇦**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)
[![i18n](https://img.shields.io/badge/i18n-AR%20%7C%20EN-orange.svg)](https://www.i18next.com/)

## 🎯 Overview

SCK is a modern, AI-powered administrative consulting platform built for businesses in Egypt and Saudi Arabia. Features multi-language support (Arabic/English), PWA capabilities, and AI-powered chatbot.

## ✨ Features

- 🌍 **Multi-Language** - Arabic (RTL) & English (LTR)
- 📱 **Progressive Web App** - Install on mobile, works offline
- 🤖 **AI Chatbot** - Powered by Groq AI
- 📊 **Admin Dashboard Ready** - Backend structure prepared
- ⚡ **Fast & Optimized** - Vite + Tailwind CSS
- 🎨 **Modern Design** - Glassmorphism & smooth animations
- 📱 **Fully Responsive** - Mobile-first design

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router
- i18next
- Axios

### Backend
- FastAPI
- Supabase (PostgreSQL)
- Groq AI
- Pydantic

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- Groq API key

### 1. Clone & Setup

```bash
git clone https://github.com/youssef1003/sck.git
cd sck
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**Frontend .env:**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn main:app --reload
```

**Backend .env:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GROQ_API_KEY=your_groq_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Database Setup

1. Create Supabase project
2. Run SQL from `backend/database/schema.sql`
3. Update `.env` files with credentials

### Access Points
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 📦 Project Structure

```
sck/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── i18n/         # Translations
│   │   └── utils/        # Utilities
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/              # FastAPI application
│   ├── api/             # API routes
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── database/        # Database schema
│   └── requirements.txt
│
├── vercel.json          # Vercel config
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Configure:
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `cd frontend && npm install`
4. Add environment variables
5. Deploy!

**Or use Vercel CLI:**
```bash
cd frontend
vercel --prod
```

### Backend (Railway)

1. Create project on [Railway](https://railway.app)
2. Connect GitHub repo
3. Set root directory to `backend`
4. Add environment variables
5. Deploy!

**Environment Variables for Production:**
```env
# Frontend (Vercel)
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Backend (Railway)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GROQ_API_KEY=your_groq_key
CORS_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
```

## 🌍 Language Support

Switch between Arabic and English using the language button in the navbar. Language preference is saved automatically.

## 📱 PWA Features

- Install on home screen
- Works offline
- Fast loading
- App-like experience

## 🎨 Brand Identity

- **Primary Color:** Dark Blue (#0A1F44)
- **Secondary Color:** Gold (#C9A14A)
- **Typography:** Poppins (Display), Inter (Body)

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pytest
```

## 📄 License

© 2026 SCK. All rights reserved.

## 🤝 Contributing

Contributions welcome! Please follow standard Git workflow.

## 📞 Support

- **Email:** info@sck-consulting.com
- **Egypt:** +20 123 456 7890
- **Saudi Arabia:** +966 50 123 4567

---

**Made with ❤️ by SCK Team**
