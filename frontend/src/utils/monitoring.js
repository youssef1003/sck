import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

// Initialize Sentry
export const initMonitoring = () => {
  // Only initialize in production or if SENTRY_DSN is provided
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE || 'development'

  if (sentryDsn && environment === 'production') {
    Sentry.init({
      dsn: sentryDsn,
      environment: environment,
      integrations: [
        new BrowserTracing({
          // Set tracing origins to connect sentry with your frontend
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/sck-.*\.vercel\.app/,
            /^https:\/\/.*\.sck\.com/
          ],
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Release tracking
      release: `sck-frontend@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      // User context
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException
          
          // Skip network errors that are not critical
          if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
            return null
          }
          
          // Skip cancelled requests
          if (error?.name === 'AbortError') {
            return null
          }
        }
        
        return event
      }
    })

    console.log('✅ Sentry monitoring initialized')
  } else {
    console.log('ℹ️ Sentry monitoring disabled (no DSN or not in production)')
  }
}

// Error boundary component
export const ErrorBoundary = Sentry.withErrorBoundary

// Performance monitoring
export const startTransaction = (name, op = 'navigation') => {
  if (Sentry.startTransaction) {
    return Sentry.startTransaction({ name, op })
  }
  // Fallback for newer Sentry versions
  return Sentry.startSpan({ name, op }, () => {})
}

// Custom error logging
export const logError = (error, context = {}) => {
  console.error('Error logged:', error, context)
  
  Sentry.withScope((scope) => {
    // Add context
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key])
    })
    
    // Add user info if available
    const userData = localStorage.getItem('scq_user_data')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        scope.setUser({
          id: user.id,
          email: user.email,
          username: user.fullName
        })
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    Sentry.captureException(error)
  })
}

// Performance monitoring for API calls
export const monitorApiCall = async (apiCall, operationName) => {
  const transaction = startTransaction(`API: ${operationName}`, 'http')
  
  try {
    const result = await apiCall()
    transaction.setStatus('ok')
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    logError(error, { operation: operationName })
    throw error
  } finally {
    transaction.finish()
  }
}

// User feedback
export const showUserFeedback = () => {
  Sentry.showReportDialog()
}

// Set user context
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.fullName || user.name,
    role: user.role
  })
}

// Clear user context (on logout)
export const clearUserContext = () => {
  Sentry.setUser(null)
}

// Add breadcrumb for debugging
export const addBreadcrumb = (message, category = 'custom', level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level
  })
}

// Performance metrics
export const recordMetric = (name, value, unit = 'millisecond') => {
  // Record custom metrics (simplified for compatibility)
  try {
    if (Sentry.metrics && Sentry.metrics.increment) {
      Sentry.metrics.increment(name, value, {
        unit,
        tags: {
          environment: import.meta.env.MODE
        }
      })
    } else {
      // Fallback: just log the metric
      console.log(`Metric: ${name} = ${value} ${unit}`)
    }
  } catch (error) {
    console.warn('Failed to record metric:', error)
  }
}

export default {
  initMonitoring,
  ErrorBoundary,
  logError,
  monitorApiCall,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  recordMetric,
  showUserFeedback
}