// Simple test endpoint - PROTECTED IN PRODUCTION
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  // Require DEBUG_SECRET in production
  const DEBUG_SECRET = process.env.DEBUG_SECRET
  if (DEBUG_SECRET) {
    const providedSecret = req.headers['x-debug-secret']
    if (providedSecret !== DEBUG_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Debug endpoint requires x-debug-secret header'
      })
    }
  }
  
  return res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}
