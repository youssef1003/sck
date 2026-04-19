import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Home, TrendingUp, Users, Award, MessageSquare, Plus, Trash2, Edit2 } from 'lucide-react'

const HomeEditor = () => {
  const [content, setContent] = useState({
    hero: {
      title: 'SCQ للاستشارات الإدارية',
      subtitle: 'بناء السياسات والإجراءات ودراسات الجدوى وتأهيل الأيزو ISO',
      description: 'نقدم حلول استشارية متكاملة للشركات والمنظمات في المملكة العربية السعودية ومصر'
    },
    stats: [
      { label: 'عميل راضٍ', value: '500+', icon: 'users' },
      { label: 'مشروع ناجح', value: '1000+', icon: 'award' },
      { label: 'سنة خبرة', value: '15+', icon: 'trending' },
      { label: 'رضا العملاء', value: '98%', icon: 'message' }
    ],
    services: [
      {
        title: 'دراسات الجدوى الاقتصادية',
        description: 'تحليل شامل للسوق والربحية والمخاطر لإعداد دراسات استثمارية دقيقة'
      },
      {
        title: 'التخطيط الاستراتيجي',
        description: 'تطوير أطر الحوكمة والنواتج التنمية وأنظمة الإجراءات'
      },
      {
        title: 'البناء المؤسسي وتطوير المنظمات',
        description: 'إعادة تصميم الهياكل والعمليات ونماذج العمل'
      }
    ],
    testimonials: [
      {
        name: 'أحمد محمد',
        company: 'شركة النجاح',
        text: 'خدمة ممتازة وفريق محترف ساعدنا في تطوير أعمالنا بشكل كبير',
        rating: 5
      },
      {
        name: 'فاطمة علي',
        company: 'مؤسسة التميز',
        text: 'استشارات احترافية وحلول عملية أحدثت فرقاً حقيقياً',
        rating: 5
      }
    ]
  })

  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('hero')

  useEffect(() => {
    // Load saved content
    const saved = localStorage.getItem('scq_home_content')
    if (saved) {
      setContent(JSON.parse(saved))
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    localStorage.setItem('scq_home_content', JSON.stringify(content))
    showToast('تم حفظ التغييرات بنجاح')
  }

  const updateHero = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }))
  }

  const updateStat = (index, field, value) => {
    const newStats = [...content.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setContent(prev => ({ ...prev, stats: newStats }))
  }

  const updateService = (index, field, value) => {
    const newServices = [...content.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setContent(prev => ({ ...prev, services: newServices }))
  }

  const addService = () => {
    setContent(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '' }]
    }))
  }

  const removeService = (index) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const updateTestimonial = (index, field, value) => {
    const newTestimonials = [...content.testimonials]
    newTestimonials[index] = { ...newTestimonials[index], [field]: value }
    setContent(prev => ({ ...prev, testimonials: newTestimonials }))
  }

  const addTestimonial = () => {
    setContent(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { name: '', company: '', text: '', rating: 5 }]
    }))
  }

  const removeTestimonial = (index) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }))
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'stats', label: 'الإحصائيات', icon: TrendingUp },
    { id: 'services', label: 'الخدمات', icon: Award },
    { id: 'testimonials', label: 'آراء العملاء', icon: MessageSquare }
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">تعديل الصفحة الرئيسية</h2>
          <p className="text-slate-600 mt-1">تخصيص محتوى الصفحة الرئيسية</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Save className="w-5 h-5" />
          حفظ التغييرات
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">العنوان الرئيسي</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => updateHero('title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">العنوان الفرعي</label>
              <input
                type="text"
                value={content.hero.subtitle}
                onChange={(e) => updateHero('subtitle', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
              <textarea
                value={content.hero.description}
                onChange={(e) => updateHero('description', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {content.stats.map((stat, index) => (
              <div key={index} className="p-4 border-2 border-slate-100 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">القيمة</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">التسمية</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services Section */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {content.services.map((service, index) => (
              <div key={index} className="p-4 border-2 border-slate-100 rounded-xl relative">
                <button
                  onClick={() => removeService(index)}
                  className="absolute top-4 left-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-4 pr-12">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">عنوان الخدمة</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => updateService(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addService}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة خدمة جديدة
            </button>
          </div>
        )}

        {/* Testimonials Section */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            {content.testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 border-2 border-slate-100 rounded-xl relative">
                <button
                  onClick={() => removeTestimonial(index)}
                  className="absolute top-4 left-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-4 pr-12">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">الاسم</label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">الشركة</label>
                      <input
                        type="text"
                        value={testimonial.company}
                        onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">التعليق</label>
                    <textarea
                      value={testimonial.text}
                      onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">التقييم (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonial.rating}
                      onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                      className="w-32 px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addTestimonial}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة تعليق جديد
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeEditor
