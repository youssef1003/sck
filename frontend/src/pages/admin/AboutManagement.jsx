import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const AboutManagement = () => {
  const [aboutData, setAboutData] = useState({
    title_ar: 'من نحن',
    title_en: 'About Us',
    subtitle_ar: 'SCQ للاستشارات الإدارية',
    subtitle_en: 'SCQ Management Consulting',
    description_ar: 'نحن شركة رائدة في مجال الاستشارات الإدارية مع أكثر من 55 عاماً من الخبرة في تقديم حلول مبتكرة للشركات والمؤسسات.',
    description_en: 'We are a leading management consulting firm with over 55 years of experience in providing innovative solutions for companies and organizations.',
    mission_ar: 'مهمتنا هي مساعدة المؤسسات على تحقيق التميز التشغيلي والنمو المستدام من خلال حلول استشارية مبتكرة.',
    mission_en: 'Our mission is to help organizations achieve operational excellence and sustainable growth through innovative consulting solutions.',
    vision_ar: 'أن نكون الشريك الاستشاري الأول للمؤسسات في المنطقة.',
    vision_en: 'To be the first consulting partner for organizations in the region.',
    values_ar: ['التميز', 'الابتكار', 'النزاهة', 'الشراكة'],
    values_en: ['Excellence', 'Innovation', 'Integrity', 'Partnership'],
    years_experience: '55',
    clients_count: '500+',
    projects_count: '1000+',
    team_size: '50+',
    hero_image: '',
    hero_image_caption_ar: '',
    hero_image_caption_en: '',
    about_image: '',
    about_image_caption_ar: '',
    about_image_caption_en: ''
  })

  const [isSaving, setIsSaving] = useState(false)

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
      // Save to localStorage for now (will be connected to API later)
      localStorage.setItem('about_data', JSON.stringify(aboutData))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('تم حفظ التغييرات بنجاح!')
    } catch (error) {
      toast.error('فشل في حفظ التغييرات')
    } finally {
      setIsSaving(false)
    }
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
