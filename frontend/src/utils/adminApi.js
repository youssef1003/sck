import axios from 'axios'

// API Base URL
const API_URL = ''

// Create axios instance with default config
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

// ============ Generic Helpers ============
export const getAdminData = async (action, params = {}) => {
  const res = await adminApi.get(`?action=${action}`, { params })
  return res.data
}

export const createAdminData = async (action, data) => {
  const res = await adminApi.post(`?action=${action}`, data)
  return res.data
}

export const updateAdminData = async (action, data) => {
  const res = await adminApi.put(`?action=${action}`, data)
  return res.data
}

export const deleteAdminData = async (action, id) => {
  const res = await adminApi.delete(`?action=${action}`, { data: { id } })
  return res.data
}

// ============ Dashboard ============
export const getStats = async () => {
  return getAdminData('stats')
}

// ============ Users ============
export const getUsers = async (params = {}) => {
  return getAdminData('users', params)
}

export const updateUserRole = async (userId, role) => {
  return updateAdminData('users', { id: userId, role })
}

export const updateUserStatus = async (userId, isActive) => {
  return updateAdminData('users', { id: userId, is_active: isActive })
}

export const deleteUser = async (userId) => {
  return deleteAdminData('users', userId)
}

// ============ Services ============
export const getServices = async (params = {}) => {
  return getAdminData('services', params)
}

export const createService = async (service) => {
  return createAdminData('services', service)
}

export const updateService = async (serviceId, service) => {
  return updateAdminData('services', { id: serviceId, ...service })
}

export const deleteService = async (serviceId) => {
  return deleteAdminData('services', serviceId)
}

// ============ Packages ============
export const getPackages = async (params = {}) => {
  return getAdminData('packages', params)
}

export const createPackage = async (pkg) => {
  return createAdminData('packages', pkg)
}

export const updatePackage = async (packageId, pkg) => {
  return updateAdminData('packages', { id: packageId, ...pkg })
}

export const deletePackage = async (packageId) => {
  return deleteAdminData('packages', packageId)
}

// ============ Quote Requests ============
export const getQuoteRequests = async (params = {}) => {
  return getAdminData('quote-requests', params)
}

export const updateQuoteRequest = async (requestId, data) => {
  return updateAdminData('quote-requests', { id: requestId, ...data })
}

export const deleteQuoteRequest = async (requestId) => {
  return deleteAdminData('quote-requests', requestId)
}

// ============ Candidates ============
export const getCandidates = async (params = {}) => {
  return getAdminData('candidates', params)
}

export const updateCandidate = async (candidateId, data) => {
  return updateAdminData('candidates', { id: candidateId, ...data })
}

export const deleteCandidate = async (candidateId) => {
  return deleteAdminData('candidates', candidateId)
}

// ============ Contact Requests ============
export const getContactRequests = async (params = {}) => {
  return getAdminData('contact-requests', params)
}

export const updateContactRequest = async (requestId, data) => {
  return updateAdminData('contact-requests', { id: requestId, ...data })
}

export const deleteContactRequest = async (requestId) => {
  return deleteAdminData('contact-requests', requestId)
}

// ============ Bookings ============
export const getBookings = async (params = {}) => {
  return getAdminData('bookings', params)
}

export const updateBookingStatus = async (bookingId, status) => {
  return updateAdminData('bookings', { id: bookingId, status })
}

export const deleteBooking = async (bookingId) => {
  return deleteAdminData('bookings', bookingId)
}

// ============ Page Content ============
export const getPageContent = async (pageKey) => {
  return getAdminData('page-content', { page_key: pageKey })
}

export const savePageContent = async (pageKey, content) => {
  return updateAdminData('page-content', { page_key: pageKey, content })
}

// ============ Blog ============
export const getBlogPosts = async (params = {}) => {
  return getAdminData('blog', params)
}

export const createBlogPost = async (post) => {
  return createAdminData('blog', post)
}

export const updateBlogPost = async (postId, post) => {
  return updateAdminData('blog', { id: postId, ...post })
}

export const toggleBlogPublish = async (postId, isPublished) => {
  return updateAdminData('blog', { id: postId, is_published: isPublished })
}

export const deleteBlogPost = async (postId) => {
  return deleteAdminData('blog', postId)
}

// ============ Sub-Admins ============
export const getSubAdmins = async (params = {}) => {
  return getAdminData('subadmins', params)
}

export const createSubAdmin = async (subadmin) => {
  return createAdminData('subadmins', subadmin)
}

export const updateSubAdmin = async (subadminId, subadmin) => {
  return updateAdminData('subadmins', { id: subadminId, ...subadmin })
}

export const deleteSubAdmin = async (subadminId) => {
  return deleteAdminData('subadmins', subadminId)
}

// ============ Audit Logs ============
export const getAuditLogs = async (params = {}) => {
  return getAdminData('audit-logs', params)
}

export default adminApi
