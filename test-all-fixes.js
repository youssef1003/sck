#!/usr/bin/env node

/**
 * Complete Test Suite for All Fixes
 * Tests: Login, Admin API, Chatbot, Database
 */

const axios = require('axios')

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://sck-tawny.vercel.app'
const API_URL = `${BASE_URL}/api`

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@sck.com',
  password: 'scq2025'
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function addResult(name, passed, message, warning = false) {
  results.tests.push({ name, passed, message, warning })
  if (warning) {
    results.warnings++
  } else if (passed) {
    results.passed++
  } else {
    results.failed++
  }
}

// ============================================================================
// Test 1: Health Check
// ============================================================================
async function testHealthCheck() {
  log('\n📋 Test 1: Health Check', 'blue')
  log('─'.repeat(50), 'blue')
  
  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 10000
    })
    
    if (response.status === 200 && response.data.status === 'healthy') {
      logSuccess('Health check passed')
      logInfo(`Environment: ${response.data.environment?.NODE_ENV || 'unknown'}`)
      logInfo(`Supabase URL: ${response.data.environment?.SUPABASE_URL ? '✅' : '❌'}`)
      logInfo(`Supabase Key: ${response.data.environment?.SUPABASE_SERVICE_KEY ? '✅' : '❌'}`)
      logInfo(`JWT Secret: ${response.data.environment?.JWT_SECRET ? '✅' : '❌'}`)
      
      addResult('Health Check', true, 'API is healthy')
      return true
    } else {
      logError('Health check returned unexpected response')
      addResult('Health Check', false, 'Unexpected response')
      return false
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`)
    addResult('Health Check', false, error.message)
    return false
  }
}

// ============================================================================
// Test 2: Login
// ============================================================================
async function testLogin() {
  log('\n🔐 Test 2: Login', 'blue')
  log('─'.repeat(50), 'blue')
  
  try {
    const response = await axios.post(
      `${API_URL}/auth?action=login`,
      TEST_CREDENTIALS,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    )
    
    if (response.status === 200 && response.data.success) {
      const { access_token, refresh_token, user } = response.data.data
      
      if (!access_token) {
        logError('No access token in response')
        addResult('Login', false, 'Missing access token')
        return null
      }
      
      logSuccess('Login successful')
      logInfo(`User: ${user.full_name} (${user.email})`)
      logInfo(`Role: ${user.role}`)
      logInfo(`Access Token: ${access_token.substring(0, 20)}...`)
      logInfo(`Refresh Token: ${refresh_token ? '✅' : '❌'}`)
      
      addResult('Login', true, 'Login successful')
      return access_token
    } else {
      logError('Login failed: Invalid response format')
      addResult('Login', false, 'Invalid response format')
      return null
    }
  } catch (error) {
    if (error.response) {
      logError(`Login failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      addResult('Login', false, `${error.response.status}: ${error.response.data.error || 'Unknown error'}`)
    } else {
      logError(`Login failed: ${error.message}`)
      addResult('Login', false, error.message)
    }
    return null
  }
}

// ============================================================================
// Test 3: Get Current User
// ============================================================================
async function testGetCurrentUser(token) {
  log('\n👤 Test 3: Get Current User', 'blue')
  log('─'.repeat(50), 'blue')
  
  if (!token) {
    logWarning('Skipping: No token available')
    addResult('Get Current User', false, 'No token', true)
    return false
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/auth?action=me`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )
    
    if (response.status === 200 && response.data.success) {
      const { user } = response.data.data
      
      logSuccess('Get current user successful')
      logInfo(`User ID: ${user.id}`)
      logInfo(`Email: ${user.email}`)
      logInfo(`Name: ${user.full_name}`)
      logInfo(`Role: ${user.role}`)
      
      addResult('Get Current User', true, 'User data retrieved')
      return true
    } else {
      logError('Get current user failed: Invalid response')
      addResult('Get Current User', false, 'Invalid response')
      return false
    }
  } catch (error) {
    if (error.response) {
      logError(`Get current user failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      addResult('Get Current User', false, `${error.response.status}: ${error.response.data.error || 'Unknown error'}`)
    } else {
      logError(`Get current user failed: ${error.message}`)
      addResult('Get Current User', false, error.message)
    }
    return false
  }
}

// ============================================================================
// Test 4: Admin Stats
// ============================================================================
async function testAdminStats(token) {
  log('\n📊 Test 4: Admin Stats', 'blue')
  log('─'.repeat(50), 'blue')
  
  if (!token) {
    logWarning('Skipping: No token available')
    addResult('Admin Stats', false, 'No token', true)
    return false
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/admin?action=stats`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )
    
    if (response.status === 200 && response.data.success) {
      const stats = response.data.data
      
      logSuccess('Admin stats retrieved')
      logInfo(`Total Users: ${stats.totalUsers || 0}`)
      logInfo(`Total Bookings: ${stats.totalBookings || 0}`)
      logInfo(`Total Contacts: ${stats.totalContacts || 0}`)
      logInfo(`Total Blog Posts: ${stats.totalBlogPosts || 0}`)
      logInfo(`Pending Bookings: ${stats.pendingBookings || 0}`)
      logInfo(`New Contacts: ${stats.newContacts || 0}`)
      
      addResult('Admin Stats', true, 'Stats retrieved successfully')
      return true
    } else {
      logError('Admin stats failed: Invalid response')
      addResult('Admin Stats', false, 'Invalid response')
      return false
    }
  } catch (error) {
    if (error.response) {
      logError(`Admin stats failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      addResult('Admin Stats', false, `${error.response.status}: ${error.response.data.error || 'Unknown error'}`)
    } else {
      logError(`Admin stats failed: ${error.message}`)
      addResult('Admin Stats', false, error.message)
    }
    return false
  }
}

// ============================================================================
// Test 5: AI Chatbot
// ============================================================================
async function testChatbot() {
  log('\n🤖 Test 5: AI Chatbot', 'blue')
  log('─'.repeat(50), 'blue')
  
  try {
    const response = await axios.post(
      `${API_URL}/rag?action=chat`,
      {
        message: 'مرحبا، ما هي خدماتكم؟',
        language: 'ar'
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    )
    
    if (response.status === 200 && response.data.success) {
      const { response: aiResponse, conversationId, contextUsed, model } = response.data
      
      logSuccess('Chatbot response received')
      logInfo(`Response length: ${aiResponse?.length || 0} characters`)
      logInfo(`Conversation ID: ${conversationId || 'N/A'}`)
      logInfo(`Context used: ${contextUsed || 0} documents`)
      logInfo(`Model: ${model || 'Unknown'}`)
      logInfo(`Response preview: ${aiResponse?.substring(0, 100)}...`)
      
      addResult('AI Chatbot', true, 'Chatbot working correctly')
      return true
    } else {
      logError('Chatbot failed: Invalid response')
      addResult('AI Chatbot', false, 'Invalid response')
      return false
    }
  } catch (error) {
    if (error.response) {
      logError(`Chatbot failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      addResult('AI Chatbot', false, `${error.response.status}: ${error.response.data.error || 'Unknown error'}`)
    } else {
      logError(`Chatbot failed: ${error.message}`)
      addResult('AI Chatbot', false, error.message)
    }
    return false
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan')
  log('🧪 SCK Platform - Complete Test Suite', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`Testing: ${BASE_URL}`, 'cyan')
  log(`Time: ${new Date().toLocaleString()}`, 'cyan')
  log('='.repeat(60) + '\n', 'cyan')
  
  let token = null
  
  // Run tests sequentially
  await testHealthCheck()
  token = await testLogin()
  await testGetCurrentUser(token)
  await testAdminStats(token)
  await testChatbot()
  
  // Print summary
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 Test Summary', 'cyan')
  log('='.repeat(60), 'cyan')
  
  results.tests.forEach(test => {
    if (test.warning) {
      logWarning(`${test.name}: ${test.message}`)
    } else if (test.passed) {
      logSuccess(`${test.name}: ${test.message}`)
    } else {
      logError(`${test.name}: ${test.message}`)
    }
  })
  
  log('\n' + '─'.repeat(60), 'cyan')
  log(`Total Tests: ${results.tests.length}`, 'cyan')
  logSuccess(`Passed: ${results.passed}`)
  logError(`Failed: ${results.failed}`)
  if (results.warnings > 0) {
    logWarning(`Warnings: ${results.warnings}`)
  }
  log('─'.repeat(60) + '\n', 'cyan')
  
  // Exit code
  if (results.failed > 0) {
    log('❌ Some tests failed!', 'red')
    process.exit(1)
  } else if (results.warnings > 0) {
    log('⚠️  All tests passed with warnings', 'yellow')
    process.exit(0)
  } else {
    log('✅ All tests passed!', 'green')
    process.exit(0)
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`)
  console.error(error)
  process.exit(1)
})
