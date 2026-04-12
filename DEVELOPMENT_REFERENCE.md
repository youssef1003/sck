# 🎯 SCK Platform - Development Reference & Roadmap

> **Complete reference for all features, todos, and future development**

---

## 📋 Table of Contents

1. [Current Features](#current-features)
2. [Todo List](#todo-list)
3. [Feature Roadmap](#feature-roadmap)
4. [Implementation Guide](#implementation-guide)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Component Reference](#component-reference)
7. [Database Schema](#database-schema)
8. [Future Enhancements](#future-enhancements)

---

## ✅ Current Features (Completed)

### Frontend Features

#### Pages (5/5 Complete)
- [x] **Home Page**
  - Hero section with animated background
  - Services showcase with cards
  - Animated statistics counter
  - Why choose us section
  - Client testimonials
  - Call-to-action sections
  
- [x] **About Page**
  - Vision & Mission cards
  - Our approach (4-step process)
  - Company values
  - Team section ready
  
- [x] **Services Page**
  - 4 detailed service descriptions
  - Feature lists for each service
  - Alternating layout design
  - Booking CTAs
  
- [x] **Contact Page**
  - Multi-field contact form
  - Egypt & Saudi Arabia offices
  - WhatsApp button
  - Form validation
  
- [x] **Blog Page**
  - Blog post grid layout
  - Category filtering
  - Featured images
  - Read time indicators
  - Sample posts included

#### Components (12/12 Complete)
- [x] **Navbar** - Sticky, responsive, mobile menu
- [x] **Footer** - Multi-column with social links
- [x] **AIChat** - Floating chatbot widget
- [x] **Hero** - Animated hero section
- [x] **Services** - Service cards showcase
- [x] **Stats** - Animated counter
- [x] **WhyChooseUs** - Features grid
- [x] **Testimonials** - Client reviews
- [x] **CTA** - Call-to-action sections

#### UI/UX Features
- [x] Smooth animations (Framer Motion)
- [x] Glassmorphism effects
- [x] Gradient accents
- [x] Hover effects
- [x] Loading states
- [x] Error handling
- [x] Responsive design (mobile-first)
- [x] RTL support for Arabic

### Backend Features

#### API Endpoints (10/10 Complete)
- [x] **Contact API**
  - POST /api/contact/submit
  - GET /api/contact/requests
  
- [x] **Consultation API**
  - POST /api/consultation/book
  - GET /api/consultation/bookings
  - PATCH /api/consultation/bookings/{id}/status
  
- [x] **Blog API**
  - GET /api/blog/posts
  - GET /api/blog/posts/{id}
  - POST /api/blog/posts
  
- [x] **AI Chat API**
  - POST /api/ai/chat
  - DELETE /api/ai/chat/{id}
  
- [x] **Health Check**
  - GET /health
  - GET /

#### Database (4/4 Tables)
- [x] contact_requests
- [x] consultation_bookings
- [x] blog_posts
- [x] ai_conversations

#### Integrations
- [x] Supabase (PostgreSQL)
- [x] OpenAI GPT-4
- [x] CORS configuration
- [x] Environment variables

---

## 📝 Todo List

### 🔴 High Priority (Next Sprint)

#### Admin Dashboard
- [ ] **Create Admin Layout**
  - [ ] Admin navbar with logout
  - [ ] Sidebar navigation
  - [ ] Dashboard overview page
  - [ ] Responsive admin design
  
- [ ] **Contact Management**
  - [ ] View all contact requests
  - [ ] Filter by status (new, contacted, closed)
  - [ ] Mark as contacted/closed
  - [ ] Reply to contacts
  - [ ] Export to CSV
  
- [ ] **Consultation Management**
  - [ ] View all bookings
  - [ ] Calendar view
  - [ ] Confirm/reject bookings
  - [ ] Reschedule appointments
  - [ ] Send confirmation emails
  
- [ ] **Blog Management**
  - [ ] Create new posts
  - [ ] Edit existing posts
  - [ ] Delete posts
  - [ ] Rich text editor
  - [ ] Image upload
  - [ ] Draft/publish workflow
  
- [ ] **Analytics Dashboard**
  - [ ] Total visitors
  - [ ] Contact form submissions
  - [ ] Consultation bookings
  - [ ] Popular services
  - [ ] Charts and graphs

#### Authentication System
- [ ] **User Authentication**
  - [ ] Login page
  - [ ] Register page (admin only)
  - [ ] Password reset
  - [ ] JWT token management
  - [ ] Protected routes
  - [ ] Session management
  
- [ ] **Supabase Auth Integration**
  - [ ] Setup Supabase Auth
  - [ ] Email/password auth
  - [ ] Social login (Google, LinkedIn)
  - [ ] Role-based access control
  - [ ] Admin vs User roles

#### Email Notifications
- [ ] **Setup Email Service**
  - [ ] Choose provider (SendGrid/Mailgun)
  - [ ] Configure SMTP
  - [ ] Email templates
  
- [ ] **Automated Emails**
  - [ ] Contact form confirmation
  - [ ] Consultation booking confirmation
  - [ ] Booking status updates
  - [ ] Admin notifications
  - [ ] Newsletter system

### 🟡 Medium Priority (Next Month)

#### Enhanced Features
- [ ] **Search Functionality**
  - [ ] Global search
  - [ ] Blog search
  - [ ] Service search
  
- [ ] **User Profiles**
  - [ ] Client dashboard
  - [ ] Booking history
  - [ ] Profile settings
  - [ ] Saved preferences
  
- [ ] **Advanced Blog**
  - [ ] Comments system
  - [ ] Like/share buttons
  - [ ] Related posts
  - [ ] Author profiles
  - [ ] Tags and categories
  
- [ ] **File Upload**
  - [ ] Document upload for consultations
  - [ ] Image upload for blog
  - [ ] File management system
  - [ ] Supabase Storage integration

#### Payment Integration
- [ ] **Payment Gateway**
  - [ ] Choose provider (Stripe/PayPal)
  - [ ] Setup payment processing
  - [ ] Secure checkout
  
- [ ] **Consultation Payments**
  - [ ] Pricing tiers
  - [ ] Payment on booking
  - [ ] Invoice generation
  - [ ] Payment history
  - [ ] Refund system

#### Notifications
- [ ] **In-App Notifications**
  - [ ] Notification center
  - [ ] Real-time updates
  - [ ] Mark as read
  - [ ] Notification preferences
  
- [ ] **Push Notifications**
  - [ ] Browser push notifications
  - [ ] Booking reminders
  - [ ] New blog post alerts

### 🟢 Low Priority (Future)

#### Advanced Features
- [ ] **Multi-language Support**
  - [ ] English translation
  - [ ] Language switcher
  - [ ] i18n implementation
  - [ ] RTL/LTR toggle
  
- [ ] **Video Consultations**
  - [ ] Video call integration (Zoom/Meet)
  - [ ] Schedule video calls
  - [ ] Recording option
  - [ ] Screen sharing
  
- [ ] **Mobile App**
  - [ ] React Native app
  - [ ] iOS version
  - [ ] Android version
  - [ ] Push notifications
  
- [ ] **Advanced Analytics**
  - [ ] Google Analytics integration
  - [ ] Custom event tracking
  - [ ] Conversion tracking
  - [ ] A/B testing
  - [ ] Heatmaps
  
- [ ] **CRM Integration**
  - [ ] Salesforce integration
  - [ ] HubSpot integration
  - [ ] Lead management
  - [ ] Pipeline tracking

#### Performance & SEO
- [ ] **Performance Optimization**
  - [ ] Image lazy loading
  - [ ] Code splitting
  - [ ] CDN integration
  - [ ] Caching strategy
  - [ ] Service workers
  
- [ ] **SEO Enhancement**
  - [ ] Meta tags optimization
  - [ ] Sitemap generation
  - [ ] Schema markup
  - [ ] Open Graph tags
  - [ ] Twitter cards
  - [ ] Robots.txt

#### Security
- [ ] **Security Enhancements**
  - [ ] Rate limiting
  - [ ] CAPTCHA on forms
  - [ ] Two-factor authentication
  - [ ] Security headers
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] CSRF tokens

---

## 🗺️ Feature Roadmap

### Phase 1: MVP ✅ (COMPLETED)
**Timeline:** Weeks 1-4  
**Status:** ✅ Done

- [x] Core website with 5 pages
- [x] AI chatbot integration
- [x] Contact & booking forms
- [x] Blog system
- [x] Backend API
- [x] Database setup
- [x] Documentation

### Phase 2: Admin & Auth 🔄 (IN PROGRESS)
**Timeline:** Weeks 5-8  
**Status:** 🔄 Next Sprint

- [ ] Admin dashboard
- [ ] User authentication
- [ ] Email notifications
- [ ] Contact management
- [ ] Booking management
- [ ] Blog management

### Phase 3: Payments & Advanced Features
**Timeline:** Weeks 9-12  
**Status:** 📅 Planned

- [ ] Payment integration
- [ ] User profiles
- [ ] Advanced search
- [ ] File uploads
- [ ] In-app notifications
- [ ] Analytics dashboard

### Phase 4: Scale & Optimize
**Timeline:** Weeks 13-16  
**Status:** 📅 Planned

- [ ] Performance optimization
- [ ] SEO enhancement
- [ ] Multi-language support
- [ ] Video consultations
- [ ] Advanced analytics
- [ ] CRM integration

### Phase 5: Mobile & Innovation
**Timeline:** Weeks 17-20  
**Status:** 💡 Future

- [ ] Mobile app (iOS/Android)
- [ ] Progressive Web App
- [ ] Voice search
- [ ] AI recommendations
- [ ] Automated reporting
- [ ] Advanced AI features

---

## 🛠️ Implementation Guide

### How to Add Admin Dashboard

#### Step 1: Create Admin Routes
```javascript
// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  
  useEffect(() => {
    // Fetch admin stats
  }, [])
  
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {/* Dashboard content */}
    </div>
  )
}

export default AdminDashboard
```

#### Step 2: Add Admin Routes to App
```javascript
// frontend/src/App.jsx
import AdminDashboard from './pages/admin/Dashboard'
import AdminContacts from './pages/admin/Contacts'
import AdminBookings from './pages/admin/Bookings'

// Add routes
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/contacts" element={<AdminContacts />} />
<Route path="/admin/bookings" element={<AdminBookings />} />
```

#### Step 3: Create Admin API Endpoints
```python
# backend/api/routes/admin.py
from fastapi import APIRouter, Depends

router = APIRouter()

@router.get("/stats")
async def get_admin_stats():
    # Return dashboard statistics
    pass

@router.get("/contacts")
async def get_all_contacts():
    # Return all contacts
    pass
```

### How to Add Authentication

#### Step 1: Setup Supabase Auth
```javascript
// frontend/src/utils/auth.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
```

#### Step 2: Create Login Page
```javascript
// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { signIn } from '../utils/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await signIn(email, password)
    if (!error) {
      // Redirect to admin
    }
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  )
}
```

#### Step 3: Protect Admin Routes
```javascript
// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

### How to Add Email Notifications

#### Step 1: Setup Email Service
```python
# backend/services/email_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

def send_email(to_email, subject, content):
    message = Mail(
        from_email='noreply@sck-consulting.com',
        to_emails=to_email,
        subject=subject,
        html_content=content
    )
    
    sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
    response = sg.send(message)
    return response
```

#### Step 2: Create Email Templates
```python
# backend/templates/email_templates.py

def contact_confirmation_email(name):
    return f"""
    <html>
      <body>
        <h1>شكراً لتواصلك معنا، {name}!</h1>
        <p>تم استلام رسالتك وسنتواصل معك قريباً.</p>
      </body>
    </html>
    """

def booking_confirmation_email(name, date):
    return f"""
    <html>
      <body>
        <h1>تم تأكيد حجزك، {name}!</h1>
        <p>موعد الاستشارة: {date}</p>
      </body>
    </html>
    """
```

#### Step 3: Send Emails on Events
```python
# backend/api/routes/contact.py
from services.email_service import send_email
from templates.email_templates import contact_confirmation_email

@router.post("/submit")
async def submit_contact_form(contact: ContactRequest):
    # Save to database
    result = supabase.table("contact_requests").insert(data).execute()
    
    # Send confirmation email
    email_content = contact_confirmation_email(contact.name)
    send_email(contact.email, "تأكيد استلام رسالتك", email_content)
    
    return {"success": True}
```

### How to Add Payment Integration

#### Step 1: Setup Stripe
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
pip install stripe
```

#### Step 2: Create Payment Component
```javascript
// frontend/src/components/PaymentForm.jsx
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY)

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe()
  const elements = useElements()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)
    })
    
    if (!error) {
      // Process payment
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay ${amount}</button>
    </form>
  )
}
```

#### Step 3: Backend Payment Processing
```python
# backend/api/routes/payment.py
import stripe
from fastapi import APIRouter

router = APIRouter()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@router.post("/create-payment-intent")
async def create_payment_intent(amount: int):
    intent = stripe.PaymentIntent.create(
        amount=amount * 100,  # Convert to cents
        currency='usd'
    )
    return {"client_secret": intent.client_secret}
```

---

## 📡 API Endpoints Reference

### Contact API
```
POST   /api/contact/submit          - Submit contact form
GET    /api/contact/requests        - Get all contacts (Admin)
PATCH  /api/contact/{id}/status     - Update contact status (Admin)
DELETE /api/contact/{id}            - Delete contact (Admin)
```

### Consultation API
```
POST   /api/consultation/book                - Book consultation
GET    /api/consultation/bookings            - Get all bookings (Admin)
GET    /api/consultation/bookings/{id}       - Get single booking
PATCH  /api/consultation/bookings/{id}/status - Update booking status
DELETE /api/consultation/bookings/{id}       - Cancel booking
```

### Blog API
```
GET    /api/blog/posts              - Get all posts
GET    /api/blog/posts/{id}         - Get single post
POST   /api/blog/posts              - Create post (Admin)
PATCH  /api/blog/posts/{id}         - Update post (Admin)
DELETE /api/blog/posts/{id}         - Delete post (Admin)
GET    /api/blog/categories         - Get all categories
```

### AI Chat API
```
POST   /api/ai/chat                 - Send message
DELETE /api/ai/chat/{id}            - Clear conversation
GET    /api/ai/conversations        - Get all conversations (Admin)
```

### Admin API (To Be Created)
```
GET    /api/admin/stats             - Dashboard statistics
GET    /api/admin/users             - Get all users
POST   /api/admin/users             - Create user
PATCH  /api/admin/users/{id}        - Update user
DELETE /api/admin/users/{id}        - Delete user
```

### Auth API (To Be Created)
```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login
POST   /api/auth/logout             - Logout
POST   /api/auth/refresh            - Refresh token
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password
```

---

## 🧩 Component Reference

### Current Components

#### Layout Components
- **Navbar** - `frontend/src/components/Navbar.jsx`
- **Footer** - `frontend/src/components/Footer.jsx`

#### Home Page Components
- **Hero** - `frontend/src/components/home/Hero.jsx`
- **Services** - `frontend/src/components/home/Services.jsx`
- **Stats** - `frontend/src/components/home/Stats.jsx`
- **WhyChooseUs** - `frontend/src/components/home/WhyChooseUs.jsx`
- **Testimonials** - `frontend/src/components/home/Testimonials.jsx`
- **CTA** - `frontend/src/components/home/CTA.jsx`

#### Feature Components
- **AIChat** - `frontend/src/components/AIChat.jsx`

### Components to Create

#### Admin Components
- [ ] **AdminLayout** - Admin page layout
- [ ] **AdminSidebar** - Navigation sidebar
- [ ] **AdminNavbar** - Admin top bar
- [ ] **StatsCard** - Dashboard stat cards
- [ ] **DataTable** - Reusable data table
- [ ] **ContactCard** - Contact request card
- [ ] **BookingCard** - Booking card
- [ ] **BlogEditor** - Rich text editor

#### Auth Components
- [ ] **LoginForm** - Login form
- [ ] **RegisterForm** - Registration form
- [ ] **PasswordReset** - Password reset form
- [ ] **ProtectedRoute** - Route protection

#### Common Components
- [ ] **Modal** - Reusable modal
- [ ] **Dropdown** - Dropdown menu
- [ ] **Tabs** - Tab component
- [ ] **Pagination** - Pagination component
- [ ] **SearchBar** - Search input
- [ ] **FileUpload** - File upload component
- [ ] **DatePicker** - Date picker
- [ ] **RichTextEditor** - WYSIWYG editor

---

## 🗄️ Database Schema

### Current Tables

#### contact_requests
```sql
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
email           VARCHAR(255) NOT NULL
phone           VARCHAR(20) NOT NULL
business_type   VARCHAR(50) NOT NULL
message         TEXT NOT NULL
status          VARCHAR(20) DEFAULT 'new'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### consultation_bookings
```sql
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
email           VARCHAR(255) NOT NULL
phone           VARCHAR(20) NOT NULL
company         VARCHAR(200)
service_type    VARCHAR(100) NOT NULL
preferred_date  VARCHAR(50)
notes           TEXT
status          VARCHAR(20) DEFAULT 'pending'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### blog_posts
```sql
id              BIGSERIAL PRIMARY KEY
title           VARCHAR(255) NOT NULL
excerpt         TEXT NOT NULL
content         TEXT NOT NULL
author          VARCHAR(100) NOT NULL
category        VARCHAR(50) NOT NULL
image_url       TEXT
published_at    TIMESTAMP DEFAULT NOW()
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### ai_conversations
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         VARCHAR(255)
messages        JSONB NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### Tables to Create

#### users
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(100) NOT NULL,
  role            VARCHAR(20) DEFAULT 'user',
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### payments
```sql
CREATE TABLE payments (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  booking_id      BIGINT REFERENCES consultation_bookings(id),
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'USD',
  status          VARCHAR(20) DEFAULT 'pending',
  payment_method  VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  title           VARCHAR(255) NOT NULL,
  message         TEXT NOT NULL,
  type            VARCHAR(50) NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### files
```sql
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  filename        VARCHAR(255) NOT NULL,
  file_path       TEXT NOT NULL,
  file_size       BIGINT,
  mime_type       VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Future Enhancements

### AI Enhancements
- [ ] AI-powered business insights
- [ ] Automated report generation
- [ ] Predictive analytics
- [ ] Smart recommendations
- [ ] Voice assistant integration
- [ ] Image recognition for documents

### User Experience
- [ ] Dark mode
- [ ] Customizable dashboard
- [ ] Keyboard shortcuts
- [ ] Offline mode
- [ ] Progressive Web App
- [ ] Voice commands

### Business Features
- [ ] Subscription plans
- [ ] Loyalty program
- [ ] Referral system
- [ ] Affiliate program
- [ ] Partner portal
- [ ] White-label solution

### Integration
- [ ] Calendar sync (Google, Outlook)
- [ ] Slack integration
- [ ] Zapier integration
- [ ] API marketplace
- [ ] Webhook system
- [ ] Third-party plugins

---

## 📊 Priority Matrix

### Must Have (P0)
- Admin dashboard
- Authentication
- Email notifications

### Should Have (P1)
- Payment integration
- User profiles
- Advanced search
- File uploads

### Nice to Have (P2)
- Multi-language
- Video consultations
- Mobile app
- Advanced analytics

### Future (P3)
- Voice search
- AI recommendations
- CRM integration
- White-label

---

## 🎯 Success Metrics

### Technical Metrics
- Page load time < 2s
- API response time < 200ms
- Uptime > 99.9%
- Zero critical bugs
- Test coverage > 80%

### Business Metrics
- 100+ monthly visitors
- 50+ contact submissions
- 20+ consultation bookings
- 95% customer satisfaction
- 10+ blog readers

---

## 📝 Notes for Developers

### Code Standards
- Use TypeScript for new components
- Follow ESLint rules
- Write unit tests
- Document all functions
- Use meaningful variable names

### Git Workflow
- Create feature branches
- Write descriptive commits
- Submit pull requests
- Code review required
- Squash before merge

### Testing Strategy
- Unit tests for utilities
- Component tests for UI
- Integration tests for API
- E2E tests for critical flows
- Manual testing before deploy

---

**Last Updated:** April 8, 2026  
**Version:** 1.0.0  
**Status:** MVP Complete, Phase 2 Planning

---

*This is a living document. Update it as features are completed or priorities change.*
