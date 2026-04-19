import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
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
    const response = await apiClient.post('/api/auth/logout')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    return response.data
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
// Sub-Admins APIs
// ============================================================

export const subAdminsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/subadmins')
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/subadmins/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await apiClient.post('/api/subadmins', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/subadmins/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/subadmins/${id}`)
    return response.data
  },

  updatePermissions: async (id, permissions) => {
    const response = await apiClient.patch(`/api/subadmins/${id}/permissions`, {
      permissions
    })
    return response.data
  }
}

// ============================================================
// Employers APIs
// ============================================================

export const employersAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/employers', { params })
    return response.data
  },

  approve: async (id) => {
    const response = await apiClient.post(`/api/employers/${id}/approve`)
    return response.data
  },

  reject: async (id, reason) => {
    const response = await apiClient.post(`/api/employers/${id}/reject`, { reason })
    return response.data
  },

  activate: async (id) => {
    const response = await apiClient.patch(`/api/employers/${id}/activate`)
    return response.data
  },

  deactivate: async (id) => {
    const response = await apiClient.patch(`/api/employers/${id}/deactivate`)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/employers/${id}`)
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get('/api/employers/stats')
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

  // Bookings Management
  bookings: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/api/admin/bookings', { params })
      return response.data
    },

    updateStatus: async (bookingId, status) => {
      const response = await apiClient.patch(`/api/admin/bookings/${bookingId}/status`, { status })
      return response.data
    }
  },

  // Messages Management
  messages: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/api/admin/messages', { params })
      return response.data
    },

    updateStatus: async (messageId, status) => {
      const response = await apiClient.patch(`/api/admin/messages/${messageId}/status`, { status })
      return response.data
    },

    delete: async (messageId) => {
      const response = await apiClient.delete(`/api/admin/messages/${messageId}`)
      return response.data
    }
  },

  // Blog Management
  blog: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/api/admin/blog', { params })
      return response.data
    },

    create: async (data) => {
      const response = await apiClient.post('/api/admin/blog', data)
      return response.data
    },

    update: async (postId, data) => {
      const response = await apiClient.put(`/api/admin/blog/${postId}`, data)
      return response.data
    },

    togglePublish: async (postId, isPublished) => {
      const response = await apiClient.patch(`/api/admin/blog/${postId}/publish`, { is_published: isPublished })
      return response.data
    },

    delete: async (postId) => {
      const response = await apiClient.delete(`/api/admin/blog/${postId}`)
      return response.data
    }
  }
}

// ============================================================
// Careers APIs
// ============================================================

export const careersAPI = {
  apply: async (data) => {
    const response = await apiClient.post('/api/careers/apply', data)
    return response.data
  },

  getApplications: async (params = {}) => {
    const response = await apiClient.get('/api/careers/applications', { params })
    return response.data
  },

  updateStatus: async (applicationId, status) => {
    const response = await apiClient.patch(`/api/careers/applications/${applicationId}/status`, { status })
    return response.data
  },

  delete: async (applicationId) => {
    const response = await apiClient.delete(`/api/careers/applications/${applicationId}`)
    return response.data
  }
}

// ============================================================
// Public APIs
// ============================================================

export const publicAPI = {
  // Contact
  submitContact: async (data) => {
    const response = await apiClient.post('/api/contact/submit', data)
    return response.data
  },

  // Consultation
  bookConsultation: async (data) => {
    const response = await apiClient.post('/api/consultation/book', data)
    return response.data
  },

  // Blog
  getBlogPosts: async (params = {}) => {
    const response = await apiClient.get('/api/blog/posts', { params })
    return response.data
  },

  getBlogPost: async (postId) => {
    const response = await apiClient.get(`/api/blog/posts/${postId}`)
    return response.data
  },

  // AI Chat
  sendChatMessage: async (message, conversationId = null) => {
    const response = await apiClient.post('/api/ai/chat', {
      message,
      conversation_id: conversationId
    })
    return response.data
  }
}

export default apiClient
