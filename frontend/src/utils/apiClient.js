import axios from 'axios'

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
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await apiClient.post('/api/auth/refresh', {
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
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================
// Authentication APIs
// ============================================================

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password })
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
    const response = await apiClient.get('/api/auth/me')
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
    const response = await apiClient.post('/api/auth/refresh', {
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

  // Blog Management (placeholder - will be implemented later)
  blog: {
    getAll: async (params = {}) => {
      // Return mock data for now
      return {
        success: true,
        data: [],
        count: 0
      }
    },

    create: async (data) => {
      return { success: true, message: 'Post created' }
    },

    update: async (postId, data) => {
      return { success: true, message: 'Post updated' }
    },

    togglePublish: async (postId, isPublished) => {
      return { success: true, message: 'Post status updated' }
    },

    delete: async (postId) => {
      return { success: true, message: 'Post deleted' }
    }
  }
}

// ============================================================
// Sub-Admins APIs (placeholder - will be implemented later)
// ============================================================

export const subAdminsAPI = {
  getAll: async () => {
    return { success: true, data: [] }
  },

  getById: async (id) => {
    return { success: true, data: null }
  },

  create: async (data) => {
    return { success: true, message: 'Sub-admin created' }
  },

  update: async (id, data) => {
    return { success: true, message: 'Sub-admin updated' }
  },

  delete: async (id) => {
    return { success: true, message: 'Sub-admin deleted' }
  },

  updatePermissions: async (id, permissions) => {
    return { success: true, message: 'Permissions updated' }
  }
}

// ============================================================
// Employers APIs (placeholder - will be implemented later)
// ============================================================

export const employersAPI = {
  getAll: async (params = {}) => {
    return { success: true, data: [], count: 0 }
  },

  approve: async (id) => {
    return { success: true, message: 'Employer approved' }
  },

  reject: async (id, reason) => {
    return { success: true, message: 'Employer rejected' }
  },

  activate: async (id) => {
    return { success: true, message: 'Employer activated' }
  },

  deactivate: async (id) => {
    return { success: true, message: 'Employer deactivated' }
  },

  delete: async (id) => {
    return { success: true, message: 'Employer deleted' }
  },

  getStats: async () => {
    return { 
      success: true, 
      data: { 
        total: 0, 
        pending: 0, 
        approved: 0, 
        rejected: 0 
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
// Public APIs (placeholder - will be implemented later)
// ============================================================

export const publicAPI = {
  // Contact
  submitContact: async (data) => {
    return { success: true, message: 'Message sent successfully' }
  },

  // Consultation
  bookConsultation: async (data) => {
    return { success: true, message: 'Consultation booked successfully' }
  },

  // Blog
  getBlogPosts: async (params = {}) => {
    return { success: true, data: [], count: 0 }
  },

  getBlogPost: async (postId) => {
    return { success: true, data: null }
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
