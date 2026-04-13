import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />

          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/careers" element={<CareersManagement />} />
          <Route path="/admin/employers" element={<EmployersManagement />} />
          <Route path="/admin/pages/home" element={<HomeEditor />} />

          {/* Public Routes - With Navbar/Footer */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
