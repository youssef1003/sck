import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function RAGChat({ userId, onClose }) {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const language = i18n.language

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: language === 'ar'
          ? 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ])
  }, [language])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_URL}/api/rag/chat`,
        {
          message: input,
          conversationId: conversationId,
          language: language,
          userId: userId
        },
        {
          timeout: 30000
        }
      )

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          sources: response.data.sources,
          contextUsed: response.data.contextUsed
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (response.data.conversationId && !conversationId) {
          setConversationId(response.data.conversationId)
        }
      } else {
        throw new Error(response.data.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Chat error:', err)
      
      const errorMessage = language === 'ar'
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
        : 'Sorry, an error occurred. Please try again.'

      setError(errorMessage)
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.fallback || errorMessage,
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
            </h3>
            <p className="text-xs text-white/80">
              {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isError ? 'bg-red-100' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  {message.isError ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : message.isError
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <p className="text-xs opacity-70">
                    {language === 'ar' ? 'المصادر:' : 'Sources:'} {message.contextUsed}
                  </p>
                </div>
              )}
              
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'ar'
                ? 'اكتب رسالتك هنا...'
                : 'Type your message...'
            }
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
