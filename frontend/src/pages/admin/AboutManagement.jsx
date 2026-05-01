import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Image as ImageIcon, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const AboutManagement = () => {
  const [aboutData, setAboutData] = useState({
    title_ar: 'من نحن',
    title_en: 'About Us',
    subtitle_ar: 'SCQ للاستشارات الإدارية',
    subtitle_en: 'SCQ Management Consulting',
    description_ar: 'نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة',
    description_en: 'At SCQ, we believe that every company has the ability to grow with the right strategy',
    mission_ar: 'تقديم حلول إدارية عالية التأثير باستخدام استراتيجيات حديثة وبيانات وتكنولوجيا متقدمة',
    mission_en: 'Providing high-impact management solutions using modern strategies, data, and advanced technology',
    vision_ar: 'أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط تحول كيفية نمو الشركات واتخاذ القرارات',
    vision_en: 'To become a leading digital consulting platform in the Middle East that transforms how companies grow and make decisions',
    values_ar: ['التميز', 'الابتكار', 'النزاهة', 'الشراكة', 'النتائج'],
    values_en: ['Excellence', 'Innovation', 'Integrity', 'Partnership', 'Results'],
    years_experience: '25+',
    clients_count: '500+',
    projects_count: '1000+',
    team_size: '50+',
    hero_image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    hero_image_caption_ar: '',
    hero_image_caption_en: '',
    about_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    about_image_caption_ar: '',
    about_image_caption_en: ''
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing content
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('/api/admin?action=page-content&page_key=about', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success && response.data.data) {
        setAboutData(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to load content:', error)
      // Keep default values
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setAboutData({ ...aboutData, [field]: value })
  }

  const handleArrayChange = (field, index, value) => {
    const newArray = [...aboutData[field]]
    newArray[index] = value
    setAboutData({ ...aboutData, [field]: newArray })
  }

  const addValue = (field) => {
    setAboutData({ ...aboutData, [field]: [...aboutData[field], ''] })
  }

  const removeValue = (field, index) => {
    const newArray = aboutData[field].filter((_, i) => i !== index)
    setAboutData({ ...aboutData, [field]: newArray })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      
      const response = await axios.post('/api/admin?action=page-content', {
        page_key: 'about',
        content: aboutData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.success('تم حفظ التغييرات بنجاح! ✅')
      } else {
        throw new Error(response.data.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('فشل في حفظ التغييرات ❌')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل المحتوى...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة صفحة "من نحن"</h1>
          <p className="text-slate-600 mt-2">تعديل محتوى صفحة من نحن</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">المعلومات الأساسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (عربي)
              </label>
              <input
                type="text"
                value={aboutData.title_ar}
                onChange={(e) => handleChange('title_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (English)
              </label>
              <input
                type="text"
                value={aboutData.title_en}
                onChange={(e) => handleChange('title_en', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان الفرعي (عربي)
              </label>
              <input
                type="text"
                value={aboutData.subtitle_ar}
                onChange={(e) => handleChange('subtitle_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان الفرعي (English)
              </label>
              <input
                type="text"
                value={aboutData.subtitle_en}
                onChange={(e) => handleChange('subtitle_en', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الوصف (عربي)
              </label>
              <textarea
                value={aboutData.description_ar}
                onChange={(e) => handleChange('description_ar', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الوصف (English)
              </label>
              <textarea
                value={aboutData.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">الرؤية والرسالة</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الرسالة (عربي)
              </label>
              <textarea
                value={aboutData.mission_ar}
                onChange={(e) => handleChange('mission_ar', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الرسالة (English)
              </label>
              <textarea
                value={aboutData.mission_en}
                onChange={(e) => handleChange('mission_en', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الرؤية (عربي)
              </label>
              <textarea
                value={aboutData.vision_ar}
                onChange={(e) => handleChange('vision_ar', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الرؤية (English)
              </label>
              <textarea
                value={aboutData.vision_en}
                onChange={(e) => handleChange('vision_en', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">الإحصائيات</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                سنوات الخبرة
              </label>
              <input
                type="text"
                value={aboutData.years_experience}
                onChange={(e) => handleChange('years_experience', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                عدد العملاء
              </label>
              <input
                type="text"
                value={aboutData.clients_count}
                onChange={(e) => handleChange('clients_count', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                عدد المشاريع
              </label>
              <input
                type="text"
                value={aboutData.projects_count}
                onChange={(e) => handleChange('projects_count', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                حجم الفريق
              </label>
              <input
                type="text"
                value={aboutData.team_size}
                onChange={(e) => handleChange('team_size', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">الصور</h2>
          
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">صورة الغلاف</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رابط الصورة
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aboutData.hero_image}
                      onChange={(e) => handleChange('hero_image', e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                      <ImageIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نص تحت الصورة (عربي)
                  </label>
                  <input
                    type="text"
                    value={aboutData.hero_image_caption_ar}
                    onChange={(e) => handleChange('hero_image_caption_ar', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: مقر الشركة الرئيسي"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نص تحت الصورة (English)
                  </label>
                  <input
                    type="text"
                    value={aboutData.hero_image_caption_en}
                    onChange={(e) => handleChange('hero_image_caption_en', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Example: Company Headquarters"
                  />
                </div>
              </div>
            </div>

            {/* About Image */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">صورة "من نحن"</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رابط الصورة
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aboutData.about_image}
                      onChange={(e) => handleChange('about_image', e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                      <ImageIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نص تحت الصورة (عربي)
                  </label>
                  <input
                    type="text"
                    value={aboutData.about_image_caption_ar}
                    onChange={(e) => handleChange('about_image_caption_ar', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: فريق العمل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نص تحت الصورة (English)
                  </label>
                  <input
                    type="text"
                    value={aboutData.about_image_caption_en}
                    onChange={(e) => handleChange('about_image_caption_en', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Example: Our Team"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-lg font-medium"
        >
          <Save className="w-6 h-6" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
        </button>
      </div>
    </div>
  )
}

export default AboutManagement
