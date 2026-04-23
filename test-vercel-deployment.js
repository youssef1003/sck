#!/usr/bin/env node

/**
 * Complete Vercel + Supabase Deployment Test
 * Tests all API endpoints and functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://sck-tawny.vercel.app';
const ADMIN_EMAIL = 'admin@sck.com';
const ADMIN_PASSWORD = 'scq2025';

let accessToken = '';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status === 200 && response.data.status === 'healthy') {
      console.log('✅ Health check passed');
      console.log(`   Database: ${response.data.database}`);
      console.log(`   Response time: ${response.data.responseTime}`);
      return true;
    } else {
      console.log('❌ Health check failed');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
    
    if (response.status === 200 && response.data.success) {
      accessToken = response.data.data.access_token;
      console.log('✅ Login successful');
      console.log(`   User: ${response.data.data.user.full_name}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      console.log(`   Token: ${accessToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('\n👤 Testing Get Current User...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Get current user successful');
      console.log(`   User ID: ${response.data.data.user.id}`);
      console.log(`   Email: ${response.data.data.user.email}`);
      return true;
    } else {
      console.log('❌ Get current user failed');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Get current user error:', error.message);
    return false;
  }
}

async function testAdminStats() {
  console.log('\n📊 Testing Admin Stats...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin stats successful');
      console.log(`   Users: ${response.data.data.users}`);
      console.log(`   Bookings: ${response.data.data.bookings}`);
      console.log(`   Contacts: ${response.data.data.contacts}`);
      console.log(`   Blog Posts: ${response.data.data.blog_posts}`);
      return true;
    } else {
      console.log('❌ Admin stats failed');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin stats error:', error.message);
    return false;
  }
}

async function testGetUsers() {
  console.log('\n👥 Testing Get Users...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/users?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Get users successful');
      console.log(`   Total users: ${response.data.count}`);
      console.log(`   Users in page: ${response.data.data.length}`);
      return true;
    } else {
      console.log('❌ Get users failed');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Get users error:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🌐 Testing Frontend Access...');
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.status === 200) {
      console.log('✅ Frontend accessible');
      console.log(`   Status: ${response.status}`);
      return true;
    } else {
      console.log('❌ Frontend not accessible');
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend access error:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete Vercel + Supabase Deployment Test');
  console.log(`📍 Testing URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Admin Login', fn: testLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Admin Stats', fn: testAdminStats },
    { name: 'Get Users', fn: testGetUsers },
    { name: 'Frontend Access', fn: testFrontendAccess }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your deployment is working perfectly!');
    console.log('\n🔗 Next Steps:');
    console.log(`   1. Visit: ${BASE_URL}/login`);
    console.log(`   2. Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('   3. Explore the admin dashboard');
    console.log('   4. Test user registration and other features');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify environment variables in Vercel');
    console.log('   2. Check Supabase database migration');
    console.log('   3. Ensure all API endpoints are deployed');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});