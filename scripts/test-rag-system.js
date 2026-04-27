require('dotenv').config()
const axios = require('axios')

const API_URL = process.env.API_URL || 'http://localhost:3000'

const testCases = [
  {
    name: 'English Query - Services',
    message: 'What services do you offer?',
    language: 'en',
    expectedKeywords: ['service', 'consulting', 'offer']
  },
  {
    name: 'Arabic Query - Services',
    message: 'ما هي الخدمات التي تقدمونها؟',
    language: 'ar',
    expectedKeywords: ['خدمات', 'استشارات']
  },
  {
    name: 'English Query - Company Info',
    message: 'Tell me about your company',
    language: 'en',
    expectedKeywords: ['SCK', 'consulting', 'company']
  },
  {
    name: 'Arabic Query - Company Info',
    message: 'أخبرني عن شركتكم',
    language: 'ar',
    expectedKeywords: ['SCK', 'شركة', 'استشارات']
  },
  {
    name: 'No Context Query',
    message: 'What is the weather today?',
    language: 'en',
    expectedKeywords: ['information', 'don\'t', 'enough']
  }
]

async function testChat(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`)
  console.log(`📝 Query: ${testCase.message}`)
  
  try {
    const startTime = Date.now()
    
    const response = await axios.post(
      `${API_URL}/api/rag/chat`,
      {
        message: testCase.message,
        language: testCase.language
      },
      {
        timeout: 30000
      }
    )
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (response.data.success) {
      console.log(`✅ Success (${duration}ms)`)
      console.log(`💬 Response: ${response.data.response.substring(0, 150)}...`)
      console.log(`📊 Context Used: ${response.data.contextUsed} documents`)
      console.log(`🔗 Sources: ${response.data.sources?.length || 0}`)
      
      // Check for expected keywords
      const hasKeywords = testCase.expectedKeywords.some(keyword => 
        response.data.response.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (hasKeywords) {
        console.log(`✅ Contains expected keywords`)
      } else {
        console.log(`⚠️  Missing expected keywords: ${testCase.expectedKeywords.join(', ')}`)
      }
      
      return { success: true, duration }
    } else {
      console.log(`❌ Failed: ${response.data.error}`)
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Data: ${JSON.stringify(error.response.data)}`)
    }
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Starting RAG System Tests')
  console.log(`🌐 API URL: ${API_URL}`)
  console.log('=' .repeat(60))
  
  const results = []
  
  for (const testCase of testCases) {
    const result = await testChat(testCase)
    results.push({ name: testCase.name, ...result })
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / passed || 0
  
  console.log(`✅ Passed: ${passed}/${testCases.length}`)
  console.log(`❌ Failed: ${failed}/${testCases.length}`)
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (passed === testCases.length) {
    console.log('🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed')
    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
