import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'

// Set initial direction based on language
const lang = localStorage.getItem('i18nextLng') || 'ar'
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = lang

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
