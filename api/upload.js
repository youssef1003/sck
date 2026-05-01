const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim().replace(/^["']|["']$/g, '')
const JWT_SECRET = process.env.JWT_SECRET?.trim().replace(/^["']|["']$/g, '')

// Validate critical environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
  console.error('CRITICAL: Missing required environment variables for upload API')
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// File type validation
const validateFileType = (fileName, bucket) => {
  const allowedTypes = {
    'avatars': ['.jpg', '.jpeg', '.png', '.webp'],
    'blog-images': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'cvs': ['.pdf', '.doc', '.docx'],
    'documents': ['.pdf', '.doc', '.docx', '.txt']
  }

  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return allowedTypes[bucket]?.includes(fileExtension) || false
}

// File size validation (in bytes)
const validateFileSize = (fileSize, bucket) => {
  const maxSizes = {
    'avatars': 5 * 1024 * 1024, // 5MB
    'blog-images': 10 * 1024 * 1024, // 10MB
    'cvs': 10 * 1024 * 1024, // 10MB
    'documents': 20 * 1024 * 1024 // 20MB
  }

  return fileSize <= (maxSizes[bucket] || 5 * 1024 * 1024)
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        return await handleUpload(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        })
    }

  } catch (error) {
    console.error('Upload API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Handle file upload
async function handleUpload(req, res) {
  // Require authentication for uploads
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required for file upload' 
    })
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    })
  }

  try {
    const { fileName, fileData, bucket, folder = '' } = req.body

    // Validation
    if (!fileName || !fileData || !bucket) {
      return res.status(400).json({
        success: false,
        error: 'fileName, fileData, and bucket are required'
      })
    }

    // Validate bucket
    const allowedBuckets = ['avatars', 'blog-images', 'cvs', 'documents']
    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bucket name'
      })
    }

    // Validate file type
    if (!validateFileType(fileName, bucket)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type for this bucket'
      })
    }

    // Convert base64 to buffer
    let fileBuffer
    try {
      // Remove data URL prefix if present
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file data format'
      })
    }

    // Validate file size
    if (!validateFileSize(fileBuffer.length, bucket)) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds limit'
      })
    }

    // Generate unique file name
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    const uniqueFileName = `${timestamp}-${randomString}${fileExtension}`
    
    // Create file path
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: getContentType(fileExtension),
        upsert: false
      })

    if (error) {
      console.error('Supabase Storage Error:', error)
      throw error
    }

    // Get public URL for public buckets
    let publicUrl = null
    if (['avatars', 'blog-images'].includes(bucket)) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
      
      publicUrl = urlData.publicUrl
    }

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicUrl,
        fileName: uniqueFileName,
        originalName: fileName,
        bucket: bucket,
        size: fileBuffer.length
      }
    })

  } catch (error) {
    console.error('Upload Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error.message
    })
  }
}

// Handle file deletion
async function handleDelete(req, res) {
  try {
    // Verify authentication for delete operations
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required for file deletion' 
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      })
    }

    const { bucket, filePath } = req.body

    // Validation
    if (!bucket || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'bucket and filePath are required'
      })
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Supabase Storage Delete Error:', error)
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      details: error.message
    })
  }
}

// Get content type based on file extension
function getContentType(extension) {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  }

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream'
}