#!/usr/bin/env node

/**
 * Test script for Vercel API functions
 * Run: node test-vercel-api.js
 */

const https = require('https')

const API_BASE = 'https://sck-tawny.vercel.app/api'
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
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function testLogin() {
  console.log('🔍 Testing login...')
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Login successful')
      console.log(`   User: ${response.data.data.user.full_name} (${response.data.data.user.role})`)
      return response.data.data.access_token
    } else {
      console.log('❌ Login failed:', response.status, response.data)
      return null
    }
  } catch (error) {
    console.log('❌ Login error:', error.message)
    return null
  }
}

async function testStats(token) {
  console.log('🔍 Testing admin stats...')
  try {
    const response = await makeRequest('GET', '/admin/stats', null, {
      'Authorization': `Bearer ${token}`
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Stats working')
      const stats = response.data.data
      console.log(`   Users: ${stats.users}`)
      console.log(`   Bookings: ${stats.bookings}`)
      console.log(`   Contacts: ${stats.contacts}`)
      console.log(`   Blog Posts: ${stats.blog_posts}`)
      return true
    } else {
      console.log('❌ Stats failed:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Stats error:', error.message)
    return false
  }
}

async function testUsers(token) {
  console.log('🔍 Testing admin users...')
  try {
    const response = await makeRequest('GET', '/admin/users', null, {
      'Authorization': `Bearer ${token}`
    })

    if (response.status === 200 && response.data.success) {
      console.log('✅ Users API working')
      console.log(`   Total users: ${response.data.count}`)
      if (response.data.data.length > 0) {
        console.log(`   First user: ${response.data.data[0].full_name} (${response.data.data[0].email})`)
      }
      return true
    } else {
      console.log('❌ Users failed:', response.status, response.data)
      return false
    }
  } catch (error) {
    console.log('❌ Users error:', error.message)
    return false
  }
}

async function main() {
  console.log('=' * 50)
  console.log('🚀 Vercel API Test Suite')
  console.log('=' * 50)

  // Test login
  const token = await testLogin()
  if (!token) {
    console.log('\n❌ Cannot proceed without valid token')
    return
  }

  // Test APIs
  const statsOk = await testStats(token)
  const usersOk = await testUsers(token)

  console.log('\n' + '=' * 50)
  console.log('📊 Test Results')
  console.log('=' * 50)
  console.log(`Login: ${token ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Stats: ${statsOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Users: ${usersOk ? '✅ PASS' : '❌ FAIL'}`)

  if (token && statsOk && usersOk) {
    console.log('\n🎉 All tests passed! Vercel API is working perfectly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the deployment and database.')
  }
}

main().catch(console.error)