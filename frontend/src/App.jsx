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
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import CareersManagement from './pages/admin/CareersManagement'
import HomeEditor from './pages/admin/HomeEditor'

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
          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/careers" element={<CareersManagement />} />
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
