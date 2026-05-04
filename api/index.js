// Consolidated API Router for Vercel Hobby Plan
// This single file handles multiple routes to stay under 12 serverless functions limit

const handleContact = require('../server/handlers/contact')
const handleBookings = require('../server/handlers/bookings')
const handleServices = require('../server/handlers/services')
const handleRecruitmentPackages = require('../server/handlers/recruitmentPackages')
const handleQuoteRequests = require('../server/handlers/quoteRequests')
const handleCandidates = require('../server/handlers/candidates')
const handleBlog = require('../server/handlers/blog')
const handlePageContent = require('../server/handlers/pageContent')

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Get route from query parameter
  const { route } = req.query

  try {
    switch (route) {
      case 'contact':
        return await handleContact(req, res)
      case 'bookings':
        return await handleBookings(req, res)
      case 'services':
        return await handleServices(req, res)
      case 'recruitment-packages':
        return await handleRecruitmentPackages(req, res)
      case 'quote-requests':
        return await handleQuoteRequests(req, res)
      case 'candidates':
        return await handleCandidates(req, res)
      case 'blog':
        return await handleBlog(req, res)
      case 'page-content':
        return await handlePageContent(req, res)
      default:
        return res.status(404).json({
          success: false,
          error: 'Route not found'
        })
    }
  } catch (error) {
    console.error('API Router Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
