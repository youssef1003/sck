import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach admin token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers['admin-token'] = token
  }
  return config
})

// Response interceptor for auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ Dashboard ============
export const getStats = async () => {
  const res = await adminApi.get('/stats')
  return res.data
}

// ============ Users ============
export const getUsers = async (params = {}) => {
  const res = await adminApi.get('/users', { params })
  return res.data
}

export const updateUserRole = async (userId, role) => {
  const res = await adminApi.patch(`/users/${userId}/role`, null, { params: { role } })
  return res.data
}

export const updateUserStatus = async (userId, isActive) => {
  const res = await adminApi.patch(`/users/${userId}/status`, null, { params: { is_active: isActive } })
  return res.data
}

export const deleteUser = async (userId) => {
  const res = await adminApi.delete(`/users/${userId}`)
  return res.data
}

// ============ Bookings ============
export const getBookings = async (params = {}) => {
  const res = await adminApi.get('/bookings', { params })
  return res.data
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await adminApi.patch(`/bookings/${bookingId}/status`, null, { params: { status } })
  return res.data
}

// ============ Messages ============
export const getMessages = async (params = {}) => {
  const res = await adminApi.get('/messages', { params })
  return res.data
}

export const updateMessageStatus = async (messageId, status) => {
  const res = await adminApi.patch(`/messages/${messageId}/status`, null, { params: { status } })
  return res.data
}

export const deleteMessage = async (messageId) => {
  const res = await adminApi.delete(`/messages/${messageId}`)
  return res.data
}

// ============ Blog ============
export const getBlogPosts = async (params = {}) => {
  const res = await adminApi.get('/blog', { params })
  return res.data
}

export const createBlogPost = async (post) => {
  const res = await adminApi.post('/blog', post)
  return res.data
}

export const updateBlogPost = async (postId, post) => {
  const res = await adminApi.put(`/blog/${postId}`, post)
  return res.data
}

export const toggleBlogPublish = async (postId, isPublished) => {
  const res = await adminApi.patch(`/blog/${postId}/publish`, null, { params: { is_published: isPublished } })
  return res.data
}

export const deleteBlogPost = async (postId) => {
  const res = await adminApi.delete(`/blog/${postId}`)
  return res.data
}

export default adminApi
