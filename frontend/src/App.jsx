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
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/Dashboard'
import CareersManagement from './pages/admin/CareersManagement'
import EmployersManagement from './pages/admin/EmployersManagement'
import HomeEditor from './pages/admin/HomeEditor'
import ContactsManagement from './pages/admin/ContactsManagement'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import EmployerDashboard from './pages/EmployerDashboard'

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

          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/careers" element={<CareersManagement />} />
          <Route path="/admin/employers" element={<EmployersManagement />} />
          <Route path="/admin/home" element={<HomeEditor />} />
          <Route path="/admin/contacts" element={<ContactsManagement />} />

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
