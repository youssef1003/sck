import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Contact API
export const submitContactForm = async (data) => {
  const response = await api.post('/api/contact/submit', data)
  return response.data
}

// Consultation API
export const bookConsultation = async (data) => {
  const response = await api.post('/api/consultation/book', data)
  return response.data
}

// Blog API
export const getBlogPosts = async (limit = 10, category = null) => {
  const params = { limit }
  if (category) params.category = category
  const response = await api.get('/api/blog/posts', { params })
  return response.data
}

export const getBlogPost = async (postId) => {
  const response = await api.get(`/api/blog/posts/${postId}`)
  return response.data
}

// AI Chat API
export const sendChatMessage = async (message, conversationId = null) => {
  const response = await api.post('/api/ai/chat', {
    message,
    conversation_id: conversationId
  })
  return response.data
}

export default api
