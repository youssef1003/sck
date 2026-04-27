# 🔌 RAG SYSTEM - INTEGRATION GUIDE

## 🎯 HOW TO ADD RAG CHAT TO YOUR EXISTING APP

This guide shows **exactly** how to integrate the RAG chat system into your existing React application **without breaking anything**.

---

## 📍 INTEGRATION POINTS

### Option 1: Floating Chat Widget (Recommended)
**Best for**: Always-available chat across all pages

### Option 2: Dedicated Chat Page
**Best for**: Full-screen chat experience

### Option 3: Embedded Chat Component
**Best for**: Chat within specific pages/sections

---

## 🚀 OPTION 1: FLOATING CHAT WIDGET

### Step 1: Import the Widget

Edit `frontend/src/App.jsx`:

```jsx
import RAGChatWidget from './components/RAGChatWidget'

function App() {
  // Your existing code...
  
  return (
    <Router>
      {/* Your existing routes and components */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* ... all your existing routes ... */}
      </Routes>
      <Footer />
      
      {/* ADD THIS: Floating chat widget */}
      <RAGChatWidget userId={getCurrentUserId()} />
    </Router>
  )
}
```

### Step 2: Get User ID

Add a helper function to get the current user ID:

```jsx
import { useState, useEffect } from 'react'

function App() {
  const [userId, setUserId] = useState(null)
  
  useEffect(() => {
    // Get user ID from your auth system
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    }
  }, [])
  
  return (
    <Router>
      {/* Your existing app */}
      
      {/* Chat widget - only show if user is logged in */}
      {userId && <RAGChatWidget userId={userId} />}
    </Router>
  )
}
```

### Step 3: That's It!

The floating chat button will appear in the bottom-right corner on all pages. Users can click it to open the chat.

---

## 🖥️ OPTION 2: DEDICATED CHAT PAGE

### Step 1: Create Chat Page

Create `frontend/src/pages/ChatPage.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RAGChat from '../components/RAGChat'

export default function ChatPage() {
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    // Get user ID from your auth system
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    } else {
      // Redirect to login if not authenticated
      navigate('/login')
    }
  }, [navigate])
  
  if (!userId) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
          <div className="h-[600px] bg-white rounded-lg shadow-lg">
            <RAGChat userId={userId} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Add Route

Edit `frontend/src/App.jsx`:

```jsx
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* ADD THIS: Chat page route */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  )
}
```

### Step 3: Add Navigation Link

Edit `frontend/src/components/Navbar.jsx`:

```jsx
import { MessageCircle } from 'lucide-react'

function Navbar() {
  return (
    <nav>
      {/* Your existing nav items */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/services">Services</Link>
      
      {/* ADD THIS: Chat link */}
      <Link to="/chat" className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        AI Chat
      </Link>
    </nav>
  )
}
```

---

## 📦 OPTION 3: EMBEDDED CHAT COMPONENT

### Use Case: Add chat to specific pages

Example: Add chat to the Services page

Edit `frontend/src/pages/Services.jsx`:

```jsx
import { useState } from 'react'
import RAGChat from '../components/RAGChat'

export default function Services() {
  const [showChat, setShowChat] = useState(false)
  const userId = getCurrentUserId() // Your auth function
  
  return (
    <div>
      {/* Your existing services content */}
      <h1>Our Services</h1>
      <div className="services-grid">
        {/* Your services */}
      </div>
      
      {/* ADD THIS: Chat section */}
      <div className="mt-12">
        <button
          onClick={() => setShowChat(!showChat)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          {showChat ? 'Hide' : 'Ask AI About Our Services'}
        </button>
        
        {showChat && (
          <div className="mt-6 h-[500px] border rounded-lg">
            <RAGChat userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🔧 CONFIGURATION OPTIONS

### Customize Chat Widget Position

Edit `frontend/src/components/RAGChatWidget.jsx`:

```jsx
// Change position
className="fixed bottom-6 right-6"  // Default
className="fixed bottom-6 left-6"   // Bottom-left
className="fixed top-6 right-6"     // Top-right
```

### Customize Chat Widget Size

```jsx
// Change size
className="w-[400px] h-[600px]"  // Default
className="w-[500px] h-[700px]"  // Larger
className="w-[350px] h-[500px]"  // Smaller
```

### Customize Colors

Edit `frontend/src/components/RAGChat.jsx`:

```jsx
// Change gradient colors
className="bg-gradient-to-r from-blue-600 to-purple-600"  // Default
className="bg-gradient-to-r from-green-600 to-teal-600"   // Green
className="bg-gradient-to-r from-red-600 to-pink-600"     // Red
```

### Customize Initial Message

Edit `frontend/src/components/RAGChat.jsx`:

```jsx
useEffect(() => {
  setMessages([
    {
      role: 'assistant',
      content: language === 'ar'
        ? 'مرحباً! كيف يمكنني مساعدتك؟'  // Change this
        : 'Hello! How can I help you?',    // Change this
      timestamp: new Date()
    }
  ])
}, [language])
```

---

## 🎨 STYLING INTEGRATION

### Match Your Brand Colors

Create `frontend/src/styles/chat-theme.css`:

```css
/* Override chat colors */
.chat-gradient {
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}

.chat-button {
  background-color: var(--primary-color);
}

.chat-message-user {
  background-color: var(--primary-color);
}

.chat-message-assistant {
  background-color: var(--gray-100);
}
```

Import in `RAGChat.jsx`:

```jsx
import '../styles/chat-theme.css'
```

---

## 🔐 AUTHENTICATION INTEGRATION

### With Supabase Auth

```jsx
import { useAuth } from './hooks/useAuth' // Your auth hook

function App() {
  const { user } = useAuth()
  
  return (
    <Router>
      {/* Your app */}
      
      {/* Only show chat if authenticated */}
      {user && <RAGChatWidget userId={user.id} />}
    </Router>
  )
}
```

### With JWT Auth

```jsx
import { jwtDecode } from 'jwt-decode'

function App() {
  const [userId, setUserId] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUserId(decoded.userId)
      } catch (error) {
        console.error('Invalid token')
      }
    }
  }, [])
  
  return (
    <Router>
      {/* Your app */}
      {userId && <RAGChatWidget userId={userId} />}
    </Router>
  )
}
```

### Without Authentication (Public Chat)

```jsx
function App() {
  // Generate anonymous user ID
  const [userId] = useState(() => {
    let id = localStorage.getItem('anonymousUserId')
    if (!id) {
      id = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('anonymousUserId', id)
    }
    return id
  })
  
  return (
    <Router>
      {/* Your app */}
      <RAGChatWidget userId={userId} />
    </Router>
  )
}
```

---

## 🌍 INTERNATIONALIZATION

### With react-i18next (Already Integrated)

The chat components already use `react-i18next` for translations. They automatically detect the current language from your i18n configuration.

No additional setup needed! ✅

### Add Custom Translations

Edit `frontend/src/i18n/locales/en.json`:

```json
{
  "chat": {
    "title": "AI Assistant",
    "placeholder": "Type your message...",
    "send": "Send",
    "thinking": "Thinking...",
    "error": "Sorry, an error occurred."
  }
}
```

Edit `frontend/src/i18n/locales/ar.json`:

```json
{
  "chat": {
    "title": "المساعد الذكي",
    "placeholder": "اكتب رسالتك...",
    "send": "إرسال",
    "thinking": "جاري التفكير...",
    "error": "عذراً، حدث خطأ."
  }
}
```

Use in component:

```jsx
import { useTranslation } from 'react-i18next'

function RAGChat() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h3>{t('chat.title')}</h3>
      <input placeholder={t('chat.placeholder')} />
    </div>
  )
}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile Optimization

The chat components are already responsive, but you can customize:

```jsx
// RAGChatWidget.jsx - Mobile adjustments
<div className={`
  fixed bottom-6 right-6 z-50
  w-[400px] h-[600px]
  md:w-[400px] md:h-[600px]
  sm:w-full sm:h-full sm:bottom-0 sm:right-0
  shadow-2xl rounded-lg overflow-hidden
`}>
  <RAGChat userId={userId} onClose={() => setIsOpen(false)} />
</div>
```

### Tablet Optimization

```jsx
<div className={`
  w-[400px] h-[600px]
  lg:w-[400px] lg:h-[600px]
  md:w-[350px] md:h-[500px]
  sm:w-full sm:h-full
`}>
```

---

## 🧪 TESTING INTEGRATION

### Test Chat Widget Appears

```jsx
// In your test file
import { render, screen } from '@testing-library/react'
import App from './App'

test('chat widget appears', () => {
  render(<App />)
  const chatButton = screen.getByLabelText('Open chat')
  expect(chatButton).toBeInTheDocument()
})
```

### Test Chat Opens

```jsx
import { fireEvent } from '@testing-library/react'

test('chat opens on button click', () => {
  render(<App />)
  const chatButton = screen.getByLabelText('Open chat')
  fireEvent.click(chatButton)
  expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument()
})
```

---

## 🚨 TROUBLESHOOTING

### Chat Widget Not Showing

**Check**:
1. Component imported correctly
2. userId is not null
3. No CSS conflicts (z-index)
4. Component rendered in correct place

**Debug**:
```jsx
console.log('User ID:', userId)
console.log('Widget rendered:', !!userId)
```

### Chat Not Sending Messages

**Check**:
1. API_URL environment variable set
2. Backend API running
3. CORS headers configured
4. Network tab in browser DevTools

**Debug**:
```jsx
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('Sending message:', message)
```

### Styling Conflicts

**Check**:
1. Tailwind CSS loaded
2. No global CSS overriding
3. z-index conflicts

**Fix**:
```jsx
// Increase z-index if needed
className="fixed ... z-[9999]"
```

---

## 📋 INTEGRATION CHECKLIST

### Before Integration
- [ ] Database schema deployed
- [ ] Environment variables set
- [ ] Backend APIs deployed
- [ ] Content ingested
- [ ] Dependencies installed

### During Integration
- [ ] Import RAGChatWidget or RAGChat
- [ ] Add to App.jsx or specific pages
- [ ] Pass userId prop
- [ ] Test in development
- [ ] Check responsive design
- [ ] Test both languages

### After Integration
- [ ] Test on all pages
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test on mobile devices
- [ ] Deploy to production
- [ ] Monitor for errors

---

## 🎯 RECOMMENDED APPROACH

### For Most Apps: Use Floating Widget

```jsx
// frontend/src/App.jsx
import RAGChatWidget from './components/RAGChatWidget'

function App() {
  const { user } = useAuth() // Your auth hook
  
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* All your routes */}
      </Routes>
      <Footer />
      
      {/* Simple one-liner integration */}
      {user && <RAGChatWidget userId={user.id} />}
    </Router>
  )
}
```

**Why?**
- ✅ Works on all pages
- ✅ Non-intrusive
- ✅ Easy to implement
- ✅ Familiar UX (like chat support widgets)
- ✅ One line of code

---

## 🎨 CUSTOMIZATION EXAMPLES

### Example 1: Custom Button

```jsx
// Custom chat button
<button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-6 right-6 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg"
>
  💬 Chat with AI
</button>
```

### Example 2: Header Integration

```jsx
// Add to navbar
<nav>
  <Link to="/">Home</Link>
  <Link to="/about">About</Link>
  <button onClick={() => setShowChat(true)}>
    Chat
  </button>
</nav>

{showChat && (
  <div className="fixed inset-0 bg-black/50 z-50">
    <div className="absolute right-0 top-0 h-full w-[400px] bg-white">
      <RAGChat userId={userId} onClose={() => setShowChat(false)} />
    </div>
  </div>
)}
```

### Example 3: Dashboard Integration

```jsx
// In admin dashboard
<div className="grid grid-cols-2 gap-6">
  <div className="col-span-1">
    {/* Dashboard stats */}
  </div>
  <div className="col-span-1">
    <div className="h-[600px] border rounded-lg">
      <RAGChat userId={adminId} />
    </div>
  </div>
</div>
```

---

## ✅ FINAL INTEGRATION CODE

### Complete Example (Copy-Paste Ready)

```jsx
// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RAGChatWidget from './components/RAGChatWidget'

// Your existing imports
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
// ... other imports

function App() {
  const [userId, setUserId] = useState(null)
  
  // Get user ID from your auth system
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserId(userData.id)
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [])
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* ... your other routes */}
          </Routes>
        </main>
        
        <Footer />
        
        {/* RAG Chat Widget - Only shows if user is logged in */}
        {userId && <RAGChatWidget userId={userId} />}
      </div>
    </Router>
  )
}

export default App
```

---

## 🎉 DONE!

Your RAG chat system is now integrated into your app!

**What you get**:
- ✅ AI-powered chat on all pages
- ✅ Context-aware responses
- ✅ Bilingual support
- ✅ Beautiful UI
- ✅ Zero breaking changes

**Next steps**:
1. Test in development
2. Deploy to production
3. Monitor usage
4. Gather feedback
5. Iterate and improve

---

**Need help?** Check the other documentation files:
- `RAG_QUICK_START.md` - Setup guide
- `RAG_SYSTEM_DOCUMENTATION.md` - Technical details
- `RAG_ARCHITECTURE.md` - System architecture

**Happy coding!** 🚀
