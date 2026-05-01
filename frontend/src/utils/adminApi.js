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
  const res = await adminApi.get('?action=stats')
  return res.data
}

// ============ Users ============
export const getUsers = async (params = {}) => {
  const res = await adminApi.get('?action=users', { params })
  return res.data
}

export const updateUserRole = async (userId, role) => {
  const res = await adminApi.patch(`?action=users`, { userId, role })
  return res.data
}

export const updateUserStatus = async (userId, isActive) => {
  const res = await adminApi.patch(`?action=users`, { userId, is_active: isActive })
  return res.data
}

export const deleteUser = async (userId) => {
  const res = await adminApi.delete(`?action=users`, { data: { userId } })
  return res.data
}

// ============ Bookings ============
export const getBookings = async (params = {}) => {
  const res = await adminApi.post('?action=manage', { 
    table: 'consultation_bookings',
    operation: 'select'
  })
  return res.data
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await adminApi.post('?action=manage', {
    table: 'consultation_bookings',
    operation: 'update',
    data: { id: bookingId, status }
  })
  return res.data
}

export const deleteBooking = async (bookingId) => {
  const res = await adminApi.post('?action=manage', {
    table: 'consultation_bookings',
    operation: 'delete',
    data: { id: bookingId }
  })
  return res.data
}

// ============ Messages ============
export const getMessages = async (params = {}) => {
  const res = await adminApi.post('?action=manage', {
    table: 'contact_requests',
    operation: 'select'
  })
  return res.data
}

export const updateMessageStatus = async (messageId, status) => {
  const res = await adminApi.post('?action=manage', {
    table: 'contact_requests',
    operation: 'update',
    data: { id: messageId, status }
  })
  return res.data
}

export const deleteMessage = async (messageId) => {
  const res = await adminApi.post('?action=manage', {
    table: 'contact_requests',
    operation: 'delete',
    data: { id: messageId }
  })
  return res.data
}

// ============ Content ============
export const getPageContent = async (pageKey) => {
  const res = await adminApi.post('?action=manage', {
    table: 'page_content',
    operation: 'select'
  })
  return res.data
}

export const savePageContent = async (pageKey, content) => {
  const res = await adminApi.post('?action=manage', {
    table: 'page_content',
    operation: 'update',
    data: { page_key: pageKey, content }
  })
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
