import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChat from './components/AIChat'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Consultation from './pages/Consultation'
import EmployerRequest from './pages/EmployerRequest'
import NotFound from './pages/NotFound'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import EmployerDashboard from './pages/EmployerDashboard'

// Admin
import AdminRoute from './components/admin/AdminRoute'
import AdminDashboard from './pages/admin/Dashboard'
import CareersManagement from './pages/admin/CareersManagement'
import EmployersManagement from './pages/admin/EmployersManagement'
import HomeEditor from './pages/admin/HomeEditor'
import ContactsManagement from './pages/admin/ContactsManagement'
import UsersManagement from './pages/admin/UsersManagement'
import BookingsManagement from './pages/admin/BookingsManagement'
import BlogManagement from './pages/admin/BlogManagement'
import SubAdminsManagement from './pages/admin/SubAdminsManagement'
import ServicesManagement from './pages/admin/ServicesManagement'
import AboutManagement from './pages/admin/AboutManagement'
import ContactManagement from './pages/admin/ContactManagement'

function App() {
  const [loading, setLoading] = useState(() => {
    // Show preloader only on first visit
    const hasVisited = sessionStorage.getItem('hasVisited')
    return !hasVisited
  })

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('hasVisited', 'true')
    setLoading(false)
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" onComplete={handlePreloaderComplete} />}
      </AnimatePresence>
      
      <Router>
        <Routes>
          {/* Auth Routes - No Navbar/Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Dashboards - No Navbar/Footer */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />

          {/* Admin Routes — Protected by AdminRoute (auth + layout) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute anyOf={['users_view', 'users_edit', 'users_delete']}><UsersManagement /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute anyOf={['bookings_view', 'bookings_edit']}><BookingsManagement /></AdminRoute>} />
          <Route path="/admin/careers" element={<AdminRoute anyOf={['careers_view', 'careers_edit']}><CareersManagement /></AdminRoute>} />
          <Route path="/admin/employers" element={<AdminRoute anyOf={['employers_view', 'employers_approve']}><EmployersManagement /></AdminRoute>} />
          <Route path="/admin/home" element={<AdminRoute permission="home_edit"><HomeEditor /></AdminRoute>} />
          <Route path="/admin/contacts" element={<AdminRoute anyOf={['messages_view', 'messages_edit']}><ContactsManagement /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute anyOf={['blog_view', 'blog_create', 'blog_edit']}><BlogManagement /></AdminRoute>} />
          <Route path="/admin/subadmins" element={<AdminRoute superAdminOnly><SubAdminsManagement /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute permission="home_edit"><ServicesManagement /></AdminRoute>} />
          <Route path="/admin/about" element={<AdminRoute permission="home_edit"><AboutManagement /></AdminRoute>} />
          <Route path="/admin/contact-page" element={<AdminRoute permission="home_edit"><ContactManagement /></AdminRoute>} />

          {/* Public Routes - With Navbar/Footer */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Home />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/about" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <About />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/services" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Services />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/careers" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Careers />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/contact" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Contact />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/blog" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Blog />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/blog/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <BlogPost />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/consultation" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Consultation />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          <Route path="/employer-request" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <EmployerRequest />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
          
          {/* 404 - Not Found */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <NotFound />
              </main>
              <Footer />
              <AIChat />
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
