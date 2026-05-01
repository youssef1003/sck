import axios from 'axios'

// FORCE Vercel API - NO Railway URLs
const API_URL = ''

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach admin token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Response interceptor for auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
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
  const res = await adminApi.get('/manage/bookings', { params })
  return res.data
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await adminApi.patch(`/manage/bookings/${bookingId}/status`, null, { params: { status } })
  return res.data
}

export const deleteBooking = async (bookingId) => {
  const res = await adminApi.delete(`/manage/bookings/${bookingId}`)
  return res.data
}

// ============ Messages ============
export const getMessages = async (params = {}) => {
  const res = await adminApi.get('/manage/messages', { params })
  return res.data
}

export const updateMessageStatus = async (messageId, status) => {
  const res = await adminApi.patch(`/manage/messages/${messageId}/status`, null, { params: { status } })
  return res.data
}

export const deleteMessage = async (messageId) => {
  const res = await adminApi.delete(`/manage/messages/${messageId}`)
  return res.data
}

// ============ Content ============
export const getPageContent = async (pageKey) => {
  const res = await adminApi.get(`/manage/content/${pageKey}`)
  return res.data
}

export const savePageContent = async (pageKey, content) => {
  const res = await adminApi.post(`/manage/content/${pageKey}`, { content })
  return res.data
}

// ============ Blog ============
export const getBlogPosts = async (params = {}) => {
  const res = await adminApi.get('?action=blog', { params })
  return res.data
}

export const createBlogPost = async (post) => {
  const res = await adminApi.post('?action=blog', post)
  return res.data
}

export const updateBlogPost = async (postId, post) => {
  const res = await adminApi.put(`/${postId}?action=blog`, post)
  return res.data
}

export const toggleBlogPublish = async (postId, isPublished) => {
  const res = await adminApi.patch(`/${postId}/publish?action=blog`, null, { params: { is_published: isPublished } })
  return res.data
}

export const deleteBlogPost = async (postId) => {
  const res = await adminApi.delete(`/${postId}?action=blog`)
  return res.data
}

export default adminApi
