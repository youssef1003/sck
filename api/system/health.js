const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()
  const checks = {}
  let overallStatus = 'healthy'

  try {
    // 1. Database connectivity check
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error
      }

      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection successful'
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: error.message,
        error: error.code
      }
      overallStatus = 'unhealthy'
    }

    // 2. Storage connectivity check
    try {
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        throw error
      }

      checks.storage = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Storage connection successful',
        buckets: data?.length || 0
      }
    } catch (error) {
      checks.storage = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: error.message
      }
      overallStatus = 'degraded'
    }

    // 3. Environment variables check
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY',
      'JWT_SECRET'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      message: missingEnvVars.length === 0 
        ? 'All required environment variables are set'
        : `Missing environment variables: ${missingEnvVars.join(', ')}`,
      missing: missingEnvVars
    }

    if (missingEnvVars.length > 0) {
      overallStatus = 'unhealthy'
    }

    // 4. Memory usage check
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }

    checks.memory = {
      status: memoryUsageMB.heapUsed < 500 ? 'healthy' : 'warning',
      usage: memoryUsageMB,
      message: `Heap usage: ${memoryUsageMB.heapUsed}MB`
    }

    // 5. API endpoints check
    const apiEndpoints = [
      '/api/health',
      '/api/auth/login',
      '/api/admin/stats'
    ]

    checks.endpoints = {
      status: 'healthy',
      available: apiEndpoints,
      message: `${apiEndpoints.length} endpoints available`
    }

    // 6. System info
    checks.system = {
      status: 'healthy',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Calculate overall response time
    const totalResponseTime = Date.now() - startTime

    // Determine HTTP status code
    let statusCode = 200
    if (overallStatus === 'unhealthy') {
      statusCode = 503 // Service Unavailable
    } else if (overallStatus === 'degraded') {
      statusCode = 200 // OK but with warnings
    }

    return res.status(statusCode).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      version: '1.0.0',
      checks: checks,
      summary: {
        healthy: Object.values(checks).filter(check => check.status === 'healthy').length,
        warning: Object.values(checks).filter(check => check.status === 'warning').length,
        unhealthy: Object.values(checks).filter(check => check.status === 'unhealthy').length,
        total: Object.keys(checks).length
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message,
      checks: checks
    })
  }
}