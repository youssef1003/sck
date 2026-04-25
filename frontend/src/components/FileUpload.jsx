import { useState, useRef } from 'react'
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FileUpload = ({ 
  bucket = 'documents', 
  folder = '', 
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onUploadSuccess,
  onUploadError,
  className = ''
}) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // File type configurations
  const bucketConfig = {
    'avatars': {
      accept: 'image/*',
      maxSize: 5 * 1024 * 1024, // 5MB
      types: ['image/jpeg', 'image/png', 'image/webp']
    },
    'blog-images': {
      accept: 'image/*',
      maxSize: 10 * 1024 * 1024, // 10MB
      types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'cvs': {
      accept: '.pdf,.doc,.docx',
      maxSize: 10 * 1024 * 1024, // 10MB
      types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    'documents': {
      accept: '.pdf,.doc,.docx,.txt',
      maxSize: 20 * 1024 * 1024, // 20MB
      types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    }
  }

  const config = bucketConfig[bucket] || bucketConfig['documents']

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-600" />
    } else {
      return <File className="w-8 h-8 text-gray-500" />
    }
  }

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (!config.types.includes(file.type)) {
      return `نوع الملف غير مدعوم. الأنواع المسموحة: ${config.types.join(', ')}`
    }

    // Check file size
    if (file.size > config.maxSize) {
      return `حجم الملف كبير جداً. الحد الأقصى: ${formatFileSize(config.maxSize)}`
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    const validFiles = []
    const errors = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(2),
          status: 'ready',
          progress: 0,
          error: null,
          url: null
        })
      }
    })

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'))
      return
    }

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    const uploadPromises = files.map(async (fileItem) => {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ))

        // Convert to base64
        const base64Data = await fileToBase64(fileItem.file)

        // Upload to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            fileName: fileItem.file.name,
            fileData: base64Data,
            bucket: bucket,
            folder: folder
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed')
        }

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'success', 
                progress: 100,
                url: result.data.publicUrl || result.data.path,
                uploadData: result.data
              }
            : f
        ))

        // Call success callback
        onUploadSuccess?.(result.data)

        return result.data

      } catch (error) {
        console.error('Upload error:', error)
        
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: error.message }
            : f
        ))

        onUploadError?.(error.message)
        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Some uploads failed:', error)
    } finally {
      setUploading(false)
    }
  }

  // Remove file
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Clear all files
  const clearFiles = () => {
    setFiles([])
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={config.accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          اسحب الملفات هنا أو اضغط للاختيار
        </h3>
        
        <p className="text-sm text-gray-500 mb-2">
          الأنواع المدعومة: {config.accept}
        </p>
        
        <p className="text-xs text-gray-400">
          الحد الأقصى للحجم: {formatFileSize(config.maxSize)}
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((fileItem) => (
              <motion.div
                key={fileItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                {/* File Icon */}
                <div className="flex-shrink-0 mr-3">
                  {getFileIcon(fileItem.file)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {fileItem.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileItem.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0 ml-3">
                  {fileItem.status === 'ready' && (
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                  )}
                  {fileItem.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {fileItem.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(fileItem.id)
                  }}
                  className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={uploadFiles}
            disabled={uploading || files.every(f => f.status === 'success')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'جاري الرفع...' : 'رفع الملفات'}
          </button>
          
          <button
            onClick={clearFiles}
            disabled={uploading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            مسح الكل
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUpload