import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { getPageContent, savePageContent } from '../../utils/adminApi'

const HomeContentEditor = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [content, setContent] = useState({
    home_quality_consulting: { title_ar: '', text_ar: '' },
    home_integrated_hr_solutions: { title_ar: '', subtitle_ar: '' },
    services_intro: { title_ar: '', text_ar: '' },
    recruitment_intro: { title_ar: '', text_ar: '' }
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const keys = Object.keys(content)
      const responses = await Promise.all(
        keys.map(key => getPageContent(key))
      )
      
      const newContent = {}
      responses.forEach((response, index) => {
        const key = keys[index]
        newContent[key] = response.data?.content || content[key]
      })
      
      setContent(newContent)
    } catch (error) {
      console.error('Error fetching content:', error)
      setError('فشل في تحميل المحتوى')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await Promise.all(
        Object.entries(content).map(([page_key, contentData]) =>
          savePageContent(page_key, contentData)
        )
      )
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving content:', error)
      setError('فشل في حفظ المحتوى')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">تحرير محتوى الصفحة الرئيسية</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">تم حفظ التغييرات بنجاح</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Quality Consulting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">قسم أنظمة الجودة والاستشارات</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العنوان</label>
              <input
                type="text"
                value={content.home_quality_consulting.title_ar || ''}
                onChange={(e) => handleChange('home_quality_consulting', 'title_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">النص</label>
              <textarea
                value={content.home_quality_consulting.text_ar || ''}
                onChange={(e) => handleChange('home_quality_consulting', 'text_ar', e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Integrated HR Solutions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">قسم الحلول المتكاملة للموارد البشرية</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العنوان</label>
              <input
                type="text"
                value={content.home_integrated_hr_solutions.title_ar || ''}
                onChange={(e) => handleChange('home_integrated_hr_solutions', 'title_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العنوان الفرعي</label>
              <input
                type="text"
                value={content.home_integrated_hr_solutions.subtitle_ar || ''}
                onChange={(e) => handleChange('home_integrated_hr_solutions', 'subtitle_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Services Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">مقدمة صفحة الخدمات</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العنوان</label>
              <input
                type="text"
                value={content.services_intro.title_ar || ''}
                onChange={(e) => handleChange('services_intro', 'title_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">النص</label>
              <textarea
                value={content.services_intro.text_ar || ''}
                onChange={(e) => handleChange('services_intro', 'text_ar', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Recruitment Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">مقدمة صفحة باقات التوظيف</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العنوان</label>
              <input
                type="text"
                value={content.recruitment_intro.title_ar || ''}
                onChange={(e) => handleChange('recruitment_intro', 'title_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">النص</label>
              <textarea
                value={content.recruitment_intro.text_ar || ''}
                onChange={(e) => handleChange('recruitment_intro', 'text_ar', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HomeContentEditor
