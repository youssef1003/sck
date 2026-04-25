import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const ServicesManagement = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      title_ar: 'استشارات إدارية',
      title_en: 'Management Consulting',
      description_ar: 'نقدم استشارات إدارية متخصصة لتحسين أداء مؤسستك',
      description_en: 'We provide specialized management consulting to improve your organization performance',
      icon: '📊',
      image: ''
    },
    {
      id: 2,
      title_ar: 'تطوير الأنظمة',
      title_en: 'Systems Development',
      description_ar: 'تطوير وتحسين الأنظمة الإدارية والتشغيلية',
      description_en: 'Development and improvement of administrative and operational systems',
      icon: '⚙️',
      image: ''
    },
    {
      id: 3,
      title_ar: 'التدريب والتطوير',
      title_en: 'Training & Development',
      description_ar: 'برامج تدريبية متخصصة لتطوير مهارات فريقك',
      description_en: 'Specialized training programs to develop your team skills',
      icon: '📚',
      image: ''
    }
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handleServiceChange = (id, field, value) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ))
  }

  const addNewService = () => {
    const newService = {
      id: Date.now(),
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      icon: '📋',
      image: ''
    }
    setServices([...services, newService])
  }

  const deleteService = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      setServices(services.filter(service => service.id !== id))
      toast.success('تم حذف الخدمة بنجاح')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage for now (will be connected to API later)
      localStorage.setItem('services_data', JSON.stringify(services))
      
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
          <h1 className="text-3xl font-bold text-slate-900">إدارة الخدمات</h1>
          <p className="text-slate-600 mt-2">تعديل وإدارة خدمات الشركة</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addNewService}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة خدمة
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">خدمة #{index + 1}</h3>
              <button
                onClick={() => deleteService(service.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان (عربي)
                </label>
                <input
                  type="text"
                  value={service.title_ar}
                  onChange={(e) => handleServiceChange(service.id, 'title_ar', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: استشارات إدارية"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان (English)
                </label>
                <input
                  type="text"
                  value={service.title_en}
                  onChange={(e) => handleServiceChange(service.id, 'title_en', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Example: Management Consulting"
                />
              </div>

              {/* Arabic Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الوصف (عربي)
                </label>
                <textarea
                  value={service.description_ar}
                  onChange={(e) => handleServiceChange(service.id, 'description_ar', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف الخدمة بالعربي..."
                />
              </div>

              {/* English Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الوصف (English)
                </label>
                <textarea
                  value={service.description_en}
                  onChange={(e) => handleServiceChange(service.id, 'description_en', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Service description in English..."
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الأيقونة (Emoji)
                </label>
                <input
                  type="text"
                  value={service.icon}
                  onChange={(e) => handleServiceChange(service.id, 'icon', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
                  placeholder="📊"
                  maxLength={2}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  رابط الصورة (اختياري)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={service.image}
                    onChange={(e) => handleServiceChange(service.id, 'image', e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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

export default ServicesManagement
