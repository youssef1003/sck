#!/usr/bin/env node

/**
 * Complete System Test for SCK Platform
 * Tests Vercel Functions + Supabase Integration
 * Run: node test-complete-system.js
 */

const https = require('https')

const API_BASE = 'https://sck-tawny.vercel.app/api'
const FRONTEND_URL = 'https://sck-tawny.vercel.app'
const ADMIN_EMAIL = 'admin@sck.com'
const ADMIN_PASSWORD = 'scq2025'

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path)
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          resolve({ status: res.statusCode, data: parsed, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers })
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

function checkFrontend() {
  return new Promise((resolve) => {
    const url = new URL(FRONTEND_URL)
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'GET'
    }

    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, headers: res.headers })
    })

    req.on('error', () => resolve({ status: 0 }))
    req.setTimeout(5000, () => {
      req.destroy()
      resolve({ status: 0 })
    })

    req.end()
  })
}

async function testFrontendAccess() {
  console.log('🌐 Testing frontend access...')
  try {
    const response = await checkFrontend()
    
    if (response.status === 200) {
      console.log('✅ Frontend is accessible')
      return true
    } else {
      console.log(`❌ Frontend access failed: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log('❌ Frontend access error:', error.message)
    return false
  }
}

async function testCORS() {
  console.log('🔒 Testing CORS configuration...')
  try {
    const response = await makeRequest('OPTIONS', '/auth/login')
    
    const corsHeaders = response.headers['access-control-allow-origin']
    if (corsHeaders) {
      console.log('✅ CORS is properly configured')
      return true
    } else {
      console.log('❌ CORS headers missing')
      return false
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message)
    return false
  }
}

async function testLogin() {
  console.log('🔐 Testing admin login...')
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login successful')
      console.log(`   User: ${response.data.data.user.full_name} (${response.data.data.user.role})`)
      console.log(`   Token expires in: ${response.data.data.expires_in} seconds`)
      return response.data.data.access_token
    } else {
      console.log('❌ Login failed:', response.status)
      console.log('   Response:', JSON.stringify(response.data, null, 2))
      return null
    }
  } catch (error) {
    console.log('❌ Login error:', error.message)
    return null
  }
}

async function testTokenRefresh(token) {
  console.log('🔄 Testing token refresh...')
  try {
    // First get a refresh token by logging in again
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (!loginResponse.data.success) {
      console.log('❌ Could not get refresh token')
      return false
    }

    const refreshToken = loginResponse.data.data.refresh_token

    const response = await makeRequest('POST', '/auth/refresh', {
      refresh_token: refreshToken
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Token refresh working')
      return true
    } else {
      console.log('❌ Token refresh failed:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Token refresh error:', error.message)
    return false
  }
}

async function testUserInfo(token) {
  console.log('👤 Testing user info endpoint...')
  try {
    const response = await makeRequest('GET', '/auth/me', null, {
      'Authorization': `Bearer ${token}`
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ User info endpoint working')
      console.log(`   User ID: ${response.data.data.id}`)
      console.log(`   Email: ${response.data.data.email}`)
      return true
    } else {
      console.log('❌ User info failed:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ User info error:', error.message)
    return false
  }
}

async function testAdminStats(token) {
  console.log('📊 Testing admin stats...')
  try {
    const response = await makeRequest('GET', '/admin/stats', null, {
      'Authorization': `Bearer ${token}`
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin stats working')
      const stats = response.data.data
      console.log(`   Users: ${stats.users}`)
      console.log(`   Bookings: ${stats.bookings}`)
      console.log(`   Contacts: ${stats.contacts}`)
      console.log(`   Blog Posts: ${stats.blog_posts}`)
      console.log(`   Pending Bookings: ${stats.pending_bookings}`)
      console.log(`   New Messages: ${stats.new_messages}`)
      
      // Check if we have reasonable data
      if (stats.users > 0) {
        console.log('✅ Database has user data')
        return true
      } else {
        console.log('⚠️  No users found in database')
        return false
      }
    } else {
      console.log('❌ Admin stats failed:', response.status)
      console.log('   Response:', JSON.stringify(response.data, null, 2))
      return false
    }
  } catch (error) {
    console.log('❌ Admin stats error:', error.message)
    return false
  }
}

async function testAdminUsers(token) {
  console.log('👥 Testing admin users endpoint...')
  try {
    const response = await makeRequest('GET', '/admin/users', null, {
      'Authorization': `Bearer ${token}`
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin users endpoint working')
      console.log(`   Total users: ${response.data.count}`)
      if (response.data.data.length > 0) {
        const firstUser = response.data.data[0]
        console.log(`   First user: ${firstUser.full_name} (${firstUser.email})`)
        console.log(`   Role: ${firstUser.role}`)
        console.log(`   Active: ${firstUser.is_active}`)
      }
      return true
    } else {
      console.log('❌ Admin users failed:', response.status)
      console.log('   Response:', JSON.stringify(response.data, null, 2))
      return false
    }
  } catch (error) {
    console.log('❌ Admin users error:', error.message)
    return false
  }
}

async function testUnauthorizedAccess() {
  console.log('🚫 Testing unauthorized access protection...')
  try {
    const response = await makeRequest('GET', '/admin/stats')

    if (response.status === 401) {
      console.log('✅ Unauthorized access properly blocked')
      return true
    } else {
      console.log('❌ Security issue: unauthorized access allowed')
      return false
    }
  } catch (error) {
    console.log('❌ Unauthorized access test error:', error.message)
    return false
  }
}

async function main() {
  console.log('=' * 60)
  console.log('🚀 SCK Platform Complete System Test')
  console.log('=' * 60)
  console.log(`Frontend: ${FRONTEND_URL}`)
  console.log(`API: ${API_BASE}`)
  console.log(`Admin: ${ADMIN_EMAIL}`)
  console.log('')

  const results = {}

  // Test frontend
  results.frontend = await testFrontendAccess()

  // Test CORS
  results.cors = await testCORS()

  // Test unauthorized access
  results.security = await testUnauthorizedAccess()

  // Test login
  const token = await testLogin()
  results.login = !!token

  if (!token) {
    console.log('\n❌ Cannot proceed without valid token')
    printSummary(results)
    return
  }

  // Test authenticated endpoints
  results.userInfo = await testUserInfo(token)
  results.tokenRefresh = await testTokenRefresh(token)
  results.adminStats = await testAdminStats(token)
  results.adminUsers = await testAdminUsers(token)

  printSummary(results)
}

function printSummary(results) {
  console.log('\n' + '=' * 60)
  console.log('📋 Test Results Summary')
  console.log('=' * 60)
  
  const tests = [
    ['Frontend Access', results.frontend],
    ['CORS Configuration', results.cors],
    ['Security (Unauthorized)', results.security],
    ['Admin Login', results.login],
    ['User Info API', results.userInfo],
    ['Token Refresh', results.tokenRefresh],
    ['Admin Stats API', results.adminStats],
    ['Admin Users API', results.adminUsers]
  ]

  tests.forEach(([name, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${name.padEnd(25)} ${status}`)
  })

  const passedCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length
  
  console.log('')
  console.log(`Overall: ${passedCount}/${totalCount} tests passed`)
  
  if (passedCount === totalCount) {
    console.log('')
    console.log('🎉 All tests passed! System is working perfectly.')
    console.log('')
    console.log('✅ Ready for production use:')
    console.log(`   • Login: ${FRONTEND_URL}/login`)
    console.log(`   • Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    console.log(`   • Dashboard: ${FRONTEND_URL}/admin`)
  } else {
    console.log('')
    console.log('⚠️  Some tests failed. Please check:')
    if (!results.frontend) console.log('   • Vercel deployment status')
    if (!results.cors) console.log('   • CORS configuration in vercel.json')
    if (!results.login) console.log('   • Database setup and admin user')
    if (!results.adminStats) console.log('   • Database tables and sample data')
    if (!results.adminUsers) console.log('   • Database permissions and RLS policies')
  }
  
  console.log('=' * 60)
}

main().catch(console.error)