# 🚀 Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway account (for backend)
- Supabase account
- Groq API key

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema applied in Supabase
- [ ] Build tested locally (`npm run build`)
- [ ] No sensitive data in code
- [ ] `.gitignore` properly configured

## 🎯 Step 1: Prepare Repository

```bash
# Ensure you're in the project root
cd sck-consulting-platform

# Add all files
git add .

# Commit
git commit -m "Production ready deployment"

# Push to GitHub
git push origin main
```

## 🌐 Step 2: Deploy Frontend (Vercel)

### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `cd frontend && npm install`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

## 🔧 Step 3: Deploy Backend (Railway)

### Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure:
   - **Root Directory:** `backend`
   - Railway will auto-detect Python

6. Add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   GROQ_API_KEY=your_groq_api_key
   CORS_ORIGINS=https://your-frontend.vercel.app
   ENVIRONMENT=production
   PORT=8000
   ```

7. Deploy!

### Get Backend URL

1. Go to Settings → Domains
2. Copy the generated URL (e.g., `https://your-app.railway.app`)
3. Update frontend environment variable `VITE_API_URL` on Vercel
4. Redeploy frontend

## 🗄️ Step 4: Setup Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy content from `backend/database/schema.sql`
4. Run the SQL
5. Get credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon/public key
   - Service Key: Settings → API → service_role key

## ✅ Step 5: Verify Deployment

### Frontend Checks
- [ ] Site loads correctly
- [ ] Language switcher works
- [ ] All pages accessible
- [ ] No console errors
- [ ] PWA installable on mobile

### Backend Checks
- [ ] API health endpoint works: `https://your-backend.railway.app/health`
- [ ] API docs accessible: `https://your-backend.railway.app/docs`
- [ ] CORS configured correctly
- [ ] Database connections work

### Integration Checks
- [ ] Contact form submits successfully
- [ ] Booking form works
- [ ] AI chatbot responds
- [ ] Blog posts load

## 🔄 Updating Deployment

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys
```

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs
- Verify `vercel.json` configuration
- Ensure all dependencies in `package.json`
- Check Node.js version compatibility

### Backend Not Starting
- Check Railway logs
- Verify environment variables
- Check `requirements.txt` for missing packages
- Ensure Python version is 3.9+

### CORS Errors
- Update `CORS_ORIGINS` in backend env
- Include your Vercel URL
- Redeploy backend

### Database Connection Issues
- Verify Supabase credentials
- Check if IP is whitelisted (Supabase allows all by default)
- Test connection locally first

## 📊 Monitoring

### Vercel Analytics
- Go to Project → Analytics
- View real-time metrics
- Monitor performance

### Railway Logs
- Go to Project → Deployments
- Click on active deployment
- View logs in real-time

## 🔐 Security Checklist

- [ ] All secrets in environment variables
- [ ] No `.env` files in repository
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] API rate limiting considered
- [ ] Input validation in place

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel:** 100GB bandwidth/month, unlimited deployments
- **Railway:** $5 free credit/month
- **Supabase:** 500MB database, 1GB storage

### Expected Costs
- Small traffic: $0/month (free tiers sufficient)
- Medium traffic: ~$10-20/month
- High traffic: Scale as needed

## 🎉 Success!

Your SCK platform is now live:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-backend.railway.app`
- **API Docs:** `https://your-backend.railway.app/docs`

---

**Last Updated:** April 2026  
**Status:** Production Ready ✅
