import axios from 'axios'
import { logError, addBreadcrumb } from './monitoring.js'

// FORCE Vercel API - NO Railway URLs allowed
const API_URL = ''  // Always use relative paths for Vercel

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Add breadcrumb for API calls
    addBreadcrumb(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 'http')
    
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    logError(error, { context: 'API Request Interceptor' })
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Add success breadcrumb
    addBreadcrumb(
      `API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, 
      'http', 
      'info'
    )
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log API errors
    logError(error, {
      context: 'API Response',
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status
    })

    // If 401 and not already retried, try to refresh token (but not on login page)
    if (error.response?.status === 401 && !originalRequest._retry && !window.location.pathname.includes('/login')) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await apiClient.post('/api/auth?action=refresh', {
          refresh_token: refreshToken
        })

        const { access_token, refresh_token: newRefreshToken } = response.data.data

        localStorage.setItem('access_token', access_token)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        logError(refreshError, { context: 'Token Refresh Failed' })
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================
// Safe API Helper - Checks JSON responses
// ============================================================

export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    
    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Expected JSON but got: ${text.slice(0, 150)}`)
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return data
  } catch (error) {
    logError(error, { context: 'Safe Fetch', url })
    throw error
  }
}

// ============================================================
// Authentication APIs
// ============================================================

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth?action=login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  },

  logout: async () => {
    // For serverless, just clear local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    return { success: true, message: 'Logged out successfully' }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth?action=me')
    return response.data
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    })
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/api/auth?action=refresh', {
      refresh_token: refreshToken
    })
    return response.data
  }
}

// ============================================================
// Admin APIs
// ============================================================

export const adminAPI = {
  // Dashboard Stats
  getStats: async () => {
    const response = await apiClient.get('/api/admin/stats')
    return response.data
  },

  // Users Management
  users: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/api/admin/users', { params })
      return response.data
    },

    updateRole: async (userId, role) => {
      const response = await apiClient.patch(`/api/admin/users/${userId}/role`, { role })
      return response.data
    },

    updateStatus: async (userId, isActive) => {
      const response = await apiClient.patch(`/api/admin/users/${userId}/status`, { is_active: isActive })
      return response.data
    },

    delete: async (userId) => {
      const response = await apiClient.delete(`/api/admin/users/${userId}`)
      return response.data
    }
  },

  // Bookings Management (placeholder - will be implemented later)
  bookings: {
    getAll: async (params = {}) => {
      // Return mock data for now
      return {
        success: true,
        data: [],
        count: 0
      }
    },

    updateStatus: async (bookingId, status) => {
      return { success: true, message: 'Status updated' }
    }
  },

  // Messages Management (placeholder - will be implemented later)
  messages: {
    getAll: async (params = {}) => {
      // Return mock data for now
      return {
        success: true,
        data: [],
        count: 0
      }
    },

    updateStatus: async (messageId, status) => {
      return { success: true, message: 'Status updated' }
    },

    delete: async (messageId) => {
      return { success: true, message: 'Message deleted' }
    }
  },

  // Blog Management
  blog: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/api/admin/management?resource=blog', { params })
      return response.data
    },

    create: async (data) => {
      const response = await apiClient.post('/api/admin/management?resource=blog', data)
      return response.data
    },

    update: async (postId, data) => {
      const response = await apiClient.put(`/api/admin/management?resource=blog&id=${postId}`, data)
      return response.data
    },

    togglePublish: async (postId, isPublished) => {
      const response = await apiClient.put(`/api/admin/management?resource=blog&id=${postId}`, { isPublished })
      return response.data
    },

    delete: async (postId) => {
      const response = await apiClient.delete(`/api/admin/management?resource=blog&id=${postId}`)
      return response.data
    }
  }
}

// ============================================================
// Sub-Admins APIs
// ============================================================

export const subAdminsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/admin/management?resource=subadmins')
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/admin/management?resource=subadmins&id=${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await apiClient.post('/api/admin/management?resource=subadmins', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/admin/management?resource=subadmins&id=${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/admin/management?resource=subadmins&id=${id}`)
    return response.data
  },

  updatePermissions: async (id, permissions) => {
    const response = await apiClient.put(`/api/admin/management?resource=subadmins&id=${id}`, { permissions })
    return response.data
  }
}

// ============================================================
// Employers APIs
// ============================================================

export const employersAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/admin/management?resource=employers', { params })
    return response.data
  },

  approve: async (employerId, rejectionReason = null) => {
    const response = await apiClient.post('/api/admin/management?resource=employers', {
      employerId,
      action: 'approve'
    })
    return response.data
  },

  reject: async (employerId, rejectionReason) => {
    const response = await apiClient.post('/api/admin/management?resource=employers', {
      employerId,
      action: 'reject',
      rejectionReason
    })
    return response.data
  },

  activate: async (id) => {
    const response = await apiClient.put(`/api/admin/management?resource=employers&id=${id}`, { isActive: true })
    return response.data
  },

  deactivate: async (id) => {
    const response = await apiClient.put(`/api/admin/management?resource=employers&id=${id}`, { isActive: false })
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/admin/management?resource=employers&id=${id}`)
    return response.data
  },

  getStats: async () => {
    // Get stats from the main employers list
    const response = await apiClient.get('/api/admin/management?resource=employers')
    const employers = response.data?.data || []
    
    return { 
      success: true, 
      data: { 
        total: employers.length,
        pending: employers.filter(e => e.approvalStatus === 'pending').length,
        approved: employers.filter(e => e.approvalStatus === 'approved').length,
        rejected: employers.filter(e => e.approvalStatus === 'rejected').length
      } 
    }
  }
}

// ============================================================
// Careers APIs (placeholder - will be implemented later)
// ============================================================

export const careersAPI = {
  apply: async (data) => {
    return { success: true, message: 'Application submitted' }
  },

  getApplications: async (params = {}) => {
    return { success: true, data: [], count: 0 }
  },

  updateStatus: async (applicationId, status) => {
    return { success: true, message: 'Status updated' }
  },

  delete: async (applicationId) => {
    return { success: true, message: 'Application deleted' }
  }
}

// ============================================================
// Public APIs
// ============================================================

export const publicAPI = {
  // Contact
  submitContact: async (data) => {
    const response = await apiClient.post('/api/contact', data)
    return response.data
  },

  // Consultation
  bookConsultation: async (data) => {
    const response = await apiClient.post('/api/bookings', data)
    return response.data
  },

  // Blog
  getBlogPosts: async (params = {}) => {
    const response = await apiClient.get('/api/admin/blog', { params })
    return response.data
  },

  getBlogPost: async (postId) => {
    const response = await apiClient.get(`/api/admin/blog?id=${postId}`)
    return response.data
  },

  // AI Chat
  sendChatMessage: async (message, conversationId = null) => {
    return { 
      success: true, 
      data: { 
        response: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        conversation_id: conversationId || 'new-conversation'
      }
    }
  }
}

// ============================================================
// System Health APIs
// ============================================================

export const systemAPI = {
  // Health Check
  getHealth: async () => {
    const response = await apiClient.get('/api/health')
    return response.data
  },

  // Backup (Super Admin only)
  downloadBackup: async () => {
    const response = await apiClient.get('/api/admin/backup', {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sck-backup-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true, message: 'Backup downloaded successfully' }
  }
}

export default apiClient

// ============================================================
// File Upload APIs
// ============================================================

export const fileAPI = {
  // Upload file
  upload: async (fileName, fileData, bucket, folder = '') => {
    const response = await apiClient.post('/api/upload', {
      fileName,
      fileData,
      bucket,
      folder
    })
    return response.data
  },

  // Delete file
  delete: async (bucket, filePath) => {
    const response = await apiClient.delete('/api/upload', {
      data: { bucket, filePath }
    })
    return response.data
  },

  // Upload multiple files
  uploadMultiple: async (files, bucket, folder = '') => {
    const uploadPromises = files.map(({ fileName, fileData }) => 
      fileAPI.upload(fileName, fileData, bucket, folder)
    )
    
    const results = await Promise.allSettled(uploadPromises)
    
    return {
      success: true,
      results: results.map((result, index) => ({
        fileName: files[index].fileName,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }))
    }
  }
}
