import { useState, useEffect } from 'react'
import { 
  Activity, 
  Database, 
  HardDrive, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  MemoryStick,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

const MonitoringDashboard = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      
      setHealthData(data)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      console.error('Failed to fetch health data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'unhealthy': return 'text-red-500'
      case 'degraded': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'unhealthy': return <XCircle className="w-5 h-5" />
      case 'degraded': return <AlertTriangle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  // Get status background
  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'unhealthy': return 'bg-red-50 border-red-200'
      case 'degraded': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading && !healthData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            مراقبة النظام
          </h1>
          <p className="text-gray-600 mt-1">
            حالة النظام والخدمات في الوقت الفعلي
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </div>
          )}
          
          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">خطأ في جلب البيانات</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {healthData && (
        <>
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-6 rounded-lg border-2 ${getStatusBg(healthData.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={getStatusColor(healthData.status)}>
                  {getStatusIcon(healthData.status)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    الحالة العامة: {healthData.status === 'healthy' ? 'سليم' : 
                                   healthData.status === 'warning' ? 'تحذير' :
                                   healthData.status === 'degraded' ? 'متدهور' : 'غير سليم'}
                  </h2>
                  <p className="text-gray-600">
                    وقت الاستجابة: {healthData.responseTime}ms
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {healthData.summary?.healthy || 0}/{healthData.summary?.total || 0}
                </div>
                <div className="text-sm text-gray-600">خدمات سليمة</div>
              </div>
            </div>
          </motion.div>

          {/* Service Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Check */}
            {healthData.checks?.database && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.database.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Database className={`w-6 h-6 ${getStatusColor(healthData.checks.database.status)}`} />
                  <h3 className="font-semibold text-gray-900">قاعدة البيانات</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {healthData.checks.database.message}
                </p>
                <div className="text-xs text-gray-500">
                  وقت الاستجابة: {healthData.checks.database.responseTime}ms
                </div>
              </motion.div>
            )}

            {/* Storage Check */}
            {healthData.checks?.storage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.storage.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <HardDrive className={`w-6 h-6 ${getStatusColor(healthData.checks.storage.status)}`} />
                  <h3 className="font-semibold text-gray-900">التخزين</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {healthData.checks.storage.message}
                </p>
                {healthData.checks.storage.buckets && (
                  <div className="text-xs text-gray-500">
                    عدد المجلدات: {healthData.checks.storage.buckets}
                  </div>
                )}
              </motion.div>
            )}

            {/* Memory Check */}
            {healthData.checks?.memory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.memory.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MemoryStick className={`w-6 h-6 ${getStatusColor(healthData.checks.memory.status)}`} />
                  <h3 className="font-semibold text-gray-900">الذاكرة</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {healthData.checks.memory.message}
                </p>
                {healthData.checks.memory.usage && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>المستخدم: {healthData.checks.memory.usage.heapUsed}MB</div>
                    <div>الإجمالي: {healthData.checks.memory.usage.heapTotal}MB</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Environment Check */}
            {healthData.checks?.environment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.environment.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Server className={`w-6 h-6 ${getStatusColor(healthData.checks.environment.status)}`} />
                  <h3 className="font-semibold text-gray-900">متغيرات البيئة</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {healthData.checks.environment.message}
                </p>
                {healthData.checks.environment.missing?.length > 0 && (
                  <div className="text-xs text-red-600">
                    مفقود: {healthData.checks.environment.missing.join(', ')}
                  </div>
                )}
              </motion.div>
            )}

            {/* API Endpoints Check */}
            {healthData.checks?.endpoints && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.endpoints.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Globe className={`w-6 h-6 ${getStatusColor(healthData.checks.endpoints.status)}`} />
                  <h3 className="font-semibold text-gray-900">نقاط النهاية</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {healthData.checks.endpoints.message}
                </p>
                <div className="text-xs text-gray-500">
                  {healthData.checks.endpoints.available?.length || 0} نقطة متاحة
                </div>
              </motion.div>
            )}

            {/* System Info */}
            {healthData.checks?.system && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-6 rounded-lg border ${getStatusBg(healthData.checks.system.status)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Activity className={`w-6 h-6 ${getStatusColor(healthData.checks.system.status)}`} />
                  <h3 className="font-semibold text-gray-900">معلومات النظام</h3>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Node.js: {healthData.checks.system.nodeVersion}</div>
                  <div>البيئة: {healthData.checks.system.environment}</div>
                  <div>وقت التشغيل: {Math.floor(healthData.checks.system.uptime / 60)} دقيقة</div>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MonitoringDashboard