require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { ingestDocument } = require('../api/rag/ingest')

/**
 * Simple PDF text extraction (requires pdf-parse package)
 * Install: npm install pdf-parse
 */
async function extractTextFromPDF(pdfPath) {
  try {
    const pdfParse = require('pdf-parse')
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error.message)
    console.log('💡 Install pdf-parse: npm install pdf-parse')
    throw error
  }
}

/**
 * Ingest a PDF file into the RAG system
 */
async function ingestPDF(pdfPath, metadata = {}) {
  console.log(`📄 Processing PDF: ${pdfPath}`)
  
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`File not found: ${pdfPath}`)
  }
  
  // Extract text from PDF
  console.log('📖 Extracting text...')
  const text = await extractTextFromPDF(pdfPath)
  
  if (!text || text.trim().length < 100) {
    throw new Error('PDF contains insufficient text')
  }
  
  console.log(`✅ Extracted ${text.length} characters`)
  
  // Prepare metadata
  const fileName = path.basename(pdfPath, '.pdf')
  const fullMetadata = {
    sourceType: 'pdf',
    sourceId: fileName,
    language: metadata.language || 'en',
    title: metadata.title || fileName,
    ...metadata
  }
  
  // Ingest into RAG system
  console.log('🔄 Ingesting into RAG system...')
  const result = await ingestDocument(text, fullMetadata)
  
  console.log(`✅ Successfully ingested!`)
  console.log(`   Job ID: ${result.jobId}`)
  console.log(`   Chunks: ${result.chunksProcessed}/${result.totalChunks}`)
  
  return result
}

/**
 * Ingest multiple PDFs from a directory
 */
async function ingestPDFDirectory(dirPath, metadata = {}) {
  console.log(`📁 Processing directory: ${dirPath}`)
  
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`)
  }
  
  const files = fs.readdirSync(dirPath)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
  
  console.log(`Found ${files.length} PDF files`)
  
  const results = []
  
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    try {
      const result = await ingestPDF(filePath, metadata)
      results.push({ file, success: true, result })
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error.message)
      results.push({ file, success: false, error: error.message })
    }
    
    // Wait between files to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📄 PDF Ingestion Script

Usage:
  node scripts/ingest-pdf.js <pdf-file-or-directory> [options]

Examples:
  # Ingest single PDF
  node scripts/ingest-pdf.js ./documents/manual.pdf
  
  # Ingest all PDFs in directory
  node scripts/ingest-pdf.js ./documents/
  
  # With metadata
  node scripts/ingest-pdf.js ./manual.pdf --language=ar --title="User Manual"

Options:
  --language=<en|ar>  Document language (default: en)
  --title=<string>    Document title
  --category=<string> Document category
    `)
    process.exit(0)
  }
  
  const targetPath = args[0]
  const metadata = {}
  
  // Parse options
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=')
      metadata[key] = value
    }
  })
  
  // Check if path is file or directory
  const stats = fs.statSync(targetPath)
  
  if (stats.isFile()) {
    ingestPDF(targetPath, metadata)
      .then(() => {
        console.log('✅ Done!')
        process.exit(0)
      })
      .catch(error => {
        console.error('❌ Error:', error.message)
        process.exit(1)
      })
  } else if (stats.isDirectory()) {
    ingestPDFDirectory(targetPath, metadata)
      .then(results => {
        const successful = results.filter(r => r.success).length
        console.log(`\n✅ Completed: ${successful}/${results.length} files`)
        process.exit(0)
      })
      .catch(error => {
        console.error('❌ Error:', error.message)
        process.exit(1)
      })
  } else {
    console.error('❌ Invalid path')
    process.exit(1)
  }
}

module.exports = { ingestPDF, ingestPDFDirectory }
