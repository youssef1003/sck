require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { ingestDocument } = require('../api/rag/ingest')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function ingestBlogPosts() {
  console.log('📚 Ingesting blog posts...')
  
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')

    if (error) throw error

    for (const post of posts || []) {
      const content = `${post.title}\n\n${post.content}`
      
      await ingestDocument(content, {
        sourceType: 'blog',
        sourceId: post.id,
        language: post.language || 'en',
        title: post.title,
        author: post.author
      })

      console.log(`✅ Ingested blog: ${post.title}`)
    }

    console.log(`✅ Completed ${posts?.length || 0} blog posts`)
  } catch (error) {
    console.error('❌ Blog ingestion error:', error)
  }
}

async function ingestServices() {
  console.log('🔧 Ingesting services...')
  
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')

    if (error) throw error

    for (const service of services || []) {
      const content = `${service.title}\n\n${service.description}\n\n${service.details || ''}`
      
      await ingestDocument(content, {
        sourceType: 'service',
        sourceId: service.id,
        language: 'en',
        title: service.title,
        category: service.category
      })

      console.log(`✅ Ingested service: ${service.title}`)
    }

    console.log(`✅ Completed ${services?.length || 0} services`)
  } catch (error) {
    console.error('❌ Service ingestion error:', error)
  }
}

async function ingestCustomContent() {
  console.log('📝 Ingesting custom content...')
  
  const customDocs = [
    {
      content: `SCK Consulting is a leading consulting firm specializing in business transformation, 
      digital strategy, and organizational development. We help companies achieve their goals through 
      innovative solutions and expert guidance.`,
      metadata: {
        sourceType: 'website',
        sourceId: 'about-company',
        language: 'en',
        title: 'About SCK Consulting'
      }
    },
    {
      content: `شركة SCK للاستشارات هي شركة استشارية رائدة متخصصة في التحول الرقمي والاستراتيجية 
      وتطوير المؤسسات. نساعد الشركات على تحقيق أهدافها من خلال حلول مبتكرة وإرشادات خبراء.`,
      metadata: {
        sourceType: 'website',
        sourceId: 'about-company-ar',
        language: 'ar',
        title: 'عن شركة SCK للاستشارات'
      }
    }
  ]

  for (const doc of customDocs) {
    try {
      await ingestDocument(doc.content, doc.metadata)
      console.log(`✅ Ingested: ${doc.metadata.title}`)
    } catch (error) {
      console.error(`❌ Failed to ingest: ${doc.metadata.title}`, error)
    }
  }
}

async function main() {
  console.log('🚀 Starting content ingestion...\n')

  await ingestBlogPosts()
  console.log('')
  
  await ingestServices()
  console.log('')
  
  await ingestCustomContent()
  console.log('')

  console.log('✅ All content ingested successfully!')
  process.exit(0)
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
