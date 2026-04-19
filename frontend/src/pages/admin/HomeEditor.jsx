import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Save, Plus, Trash2, Edit2 } from 'lucide-react'

const HomeEditor = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('hero')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Hero Section Data
  const [heroData, setHeroData] = useState({
    title_ar: 'SCQ للاستشارات الإدارية',
    title_en: 'SCQ Consulting',
    subtitle_ar: 'بناء السياسات والإجراءات ودراسات الجدوى وتأهيل الأيزو ISO',
    subtitle_en: 'Building Policies, Procedures, Feasibility Studies and ISO Certification',
    description_ar: 'نقدم حلول استشارية متكاملة للشركات والمنظمات في المملكة العربية السعودية ومصر',
    description_en: 'We provide comprehensive consulting solutions for companies and organizations in Saudi Arabia and Egypt',
    cta_ar: 'اطلب خدمة',
    cta_en: 'Request Service'
  })

  // Stats Data
  const [statsData, setStatsData] = useState([
    { value: 500, suffix: '+', label_ar: 'عميل راضٍ', label_en: 'Happy Clients' },
    { value: 1200, suffix: '+', label_ar: 'مشروع ناجح', label_en: 'Successful Projects' },
    { value: 15, suffix: '+', label_ar: 'سنة خبرة', label_en: 'Years Experience' },
    { value: 98, suffix: '%', label_ar: 'رضا العملاء', label_en: 'Client Satisfaction' }
  ])

  // Services Data
  const [servicesData, setServicesData] = useState([
    {
      id: 1,
      title_ar: 'دراسات الجدوى الاقتصادية',
      title_en: 'Economic Feasibility Studies',
      description_ar: 'تحليل شامل للسوق والربحية والمخاطر لإعداد دراسات استثمارية دقيقة',
      description_en: 'Comprehensive market, profitability and risk analysis'
    },
    {
      id: 2,
      title_ar: 'التخطيط الاستراتيجي',
      title_en: 'Strategic Planning',
      description_ar: 'تطوير أطر الحوكمة والنواتج التنمية وأنظمة الإجراءات',
      description_en: 'Developing governance frameworks and procedural systems'
    },
    {
      id: 3,
      title_ar: 'البناء المؤسسي وتطوير المنظمات',
      title_en: 'Institutional Building',
      description_ar: 'إعادة تصميم الهياكل والعمليات ونماذج العمل',
      description_en: 'Redesigning structures, processes and business models'
    }
  ])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/login')
      return
    }

    // Load saved data
    const savedHero = localStorage.getItem('scq_home_hero')
    const savedStats = localStorage.getItem('scq_home_stats')
    const savedServices = localStorage.getItem('scq_home_services')

    if (savedHero) setHeroData(JSON.parse(savedHero))
    if (savedStats) setStatsData(JSON.parse(savedStats))
    if (savedServices) setServicesData(JSON.parse(savedServices))
  }, [navigate])

  const handleSave = () => {
    setIsSaving(true)
    
    // Save to localStorage
    localStorage.setItem('scq_home_hero', JSON.stringify(heroData))
    localStorage.setItem('scq_home_stats', JSON.stringify(statsData))
    localStorage.setItem('scq_home_services', JSON.stringify(servicesData))

    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1000)
  }

  const addService = () => {
    const newService = {
      id: Date.now(),
      title_ar: 'خدمة جديدة',
      title_en: 'New Service',
      description_ar: 'وصف الخدمة',
      description_en: 'Service description'
    }
    setServicesData([...servicesData, newService])
  }

  const deleteService = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      setServicesData(servicesData.filter(s => s.id !== id))
    }
  }

  const updateService = (id, field, value) => {
    setServicesData(servicesData.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const updateStat = (index, field, value) => {
    const updated = [...statsData]
    updated[index] = { ...updated[index], [field]: value }
    setStatsData(updated)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">تعديل الصفحة الرئيسية</h1>
              <p className="text-slate-600 mt-1">Hero, Services, Stats</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </header>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-8 mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-center font-semibold"
        >
          ✓ تم حفظ التغييرات بنجاح
        </motion.div>
      )}

      <div className="p-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 mb-6">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'hero', label: 'Hero Section' },
              { id: 'stats', label: 'الإحصائيات' },
              { id: 'services', label: 'الخدمات' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Hero Tab */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      العنوان (عربي)
                    </label>
                    <input
                      type="text"
                      value={heroData.title_ar}
                      onChange={(e) => setHeroData({ ...heroData, title_ar: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={heroData.title_en}
                      onChange={(e) => setHeroData({ ...heroData, title_en: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      العنوان الفرعي (عربي)
                    </label>
                    <input
                      type="text"
                      value={heroData.subtitle_ar}
                      onChange={(e) => setHeroData({ ...heroData, subtitle_ar: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subtitle (English)
                    </label>
                    <input
                      type="text"
                      value={heroData.subtitle_en}
                      onChange={(e) => setHeroData({ ...heroData, subtitle_en: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      الوصف (عربي)
                    </label>
                    <textarea
                      value={heroData.description_ar}
                      onChange={(e) => setHeroData({ ...heroData, description_ar: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description (English)
                    </label>
                    <textarea
                      value={heroData.description_en}
                      onChange={(e) => setHeroData({ ...heroData, description_en: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      نص الزر (عربي)
                    </label>
                    <input
                      type="text"
                      value={heroData.cta_ar}
                      onChange={(e) => setHeroData({ ...heroData, cta_ar: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Button Text (English)
                    </label>
                    <input
                      type="text"
                      value={heroData.cta_en}
                      onChange={(e) => setHeroData({ ...heroData, cta_en: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {statsData.map((stat, index) => (
                  <div key={index} className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          القيمة
                        </label>
                        <input
                          type="number"
                          value={stat.value}
                          onChange={(e) => updateStat(index, 'value', parseInt(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          اللاحقة (+, %)
                        </label>
                        <input
                          type="text"
                          value={stat.suffix}
                          onChange={(e) => updateStat(index, 'suffix', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          النص (عربي)
                        </label>
                        <input
                          type="text"
                          value={stat.label_ar}
                          onChange={(e) => updateStat(index, 'label_ar', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Label (English)
                        </label>
                        <input
                          type="text"
                          value={stat.label_en}
                          onChange={(e) => updateStat(index, 'label_en', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={addService}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة خدمة
                  </button>
                </div>

                {servicesData.map((service) => (
                  <div key={service.id} className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">خدمة #{service.id}</h3>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          العنوان (عربي)
                        </label>
                        <input
                          type="text"
                          value={service.title_ar}
                          onChange={(e) => updateService(service.id, 'title_ar', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Title (English)
                        </label>
                        <input
                          type="text"
                          value={service.title_en}
                          onChange={(e) => updateService(service.id, 'title_en', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          الوصف (عربي)
                        </label>
                        <textarea
                          value={service.description_ar}
                          onChange={(e) => updateService(service.id, 'description_ar', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description (English)
                        </label>
                        <textarea
                          value={service.description_en}
                          onChange={(e) => updateService(service.id, 'description_en', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeEditor
