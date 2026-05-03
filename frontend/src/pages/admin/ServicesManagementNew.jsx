import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, 
  GripVertical, Loader, AlertCircle, CheckCircle 
} from 'lucide-react'
import { getServices, createService, updateService, deleteService } from '../../utils/adminApi'

const ServicesManagementNew = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    slug: '',
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    short_description_ar: '',
    short_description_en: '',
    details_ar: '',
    details_en: '',
    deliverables: [''],
    stages: [''],
    why_scq_ar: '',
    why_scq_en: '',
    icon: 'building',
    hero_image_url: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await getServices()
      setServices(response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('فشل في تحميل الخدمات')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDeliverableChange = (index, value) => {
    const newDeliverables = [...formData.deliverables]
    newDeliverables[index] = value
    setFormData(prev => ({ ...prev, deliverables: newDeliverables }))
  }

  const addDeliverable = () => {
    setFormData(prev => ({ ...prev, deliverables: [...prev.deliverables, ''] }))
  }

  const removeDeliverable = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }))
  }

  const handleStageChange = (index, value) => {
    const newStages = [...formData.stages]
    newStages[index] = value
    setFormData(prev => ({ ...prev, stages: newStages }))
  }

  const addStage = () => {
    setFormData(prev => ({ ...prev, stages: [...prev.stages, ''] }))
  }

  const removeStage = (index) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }))
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      slug: service.slug || '',
      title_ar: service.title_ar || '',
      title_en: service.title_en || '',
      subtitle_ar: service.subtitle_ar || '',
      subtitle_en: service.subtitle_en || '',
      short_description_ar: service.short_description_ar || '',
      short_description_en: service.short_description_en || '',
      details_ar: service.details_ar || '',
      details_en: service.details_en || '',
      deliverables: service.deliverables || [''],
      stages: service.stages || [''],
      why_scq_ar: service.why_scq_ar || '',
      why_scq_en: service.why_scq_en || '',
      icon: service.icon || 'building',
      hero_image_url: service.hero_image_url || '',
      is_active: service.is_active !== false,
      sort_order: service.sort_order || 0
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setFormData({
      slug: '',
      title_ar: '',
      title_en: '',
      subtitle_ar: '',
      subtitle_en: '',
      short_description_ar: '',
      short_description_en: '',
      details_ar: '',
      details_en: '',
      deliverables: [''],
      stages: [''],
      why_scq_ar: '',
      why_scq_en: '',
      icon: 'building',
      hero_image_url: '',
      is_active: true,
      sort_order: services.length
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Filter out empty deliverables and stages
      const cleanedData = {
        ...formData,
        deliverables: formData.deliverables.filter(d => d.trim()),
        stages: formData.stages.filter(s => s.trim())
      }

      if (editingService) {
        await updateService(editingService.id, cleanedData)
      } else {
        await createService(cleanedData)
      }

      await fetchServices()
      setShowForm(false)
      setEditingService(null)
    } catch (error) {
      console.error('Error saving service:', error)
      setError(error.response?.data?.error || 'فشل في حفظ الخدمة')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (service) => {
    try {
      await updateService(service.id, {
        is_active: !service.is_active
      })
      await fetchServices()
    } catch (error) {
      console.error('Error toggling service:', error)
      setError('فشل في تحديث حالة الخدمة')
    }
  }

  const handleDelete = async (service) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return

    try {
      await deleteService(service.id)
      await fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      setError('فشل في حذف الخدمة')
    }
  }

  const iconOptions = [
    'building', 'target', 'dollar-sign', 'file-text', 
    'bar-chart', 'users', 'briefcase', 'settings'
  ]

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">إدارة الخدمات</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة خدمة</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Services List */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الترتيب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">العنوان</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الرمز</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{service.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{service.title_ar}</div>
                    <div className="text-sm text-slate-500">{service.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{service.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {service.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(service)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                        title={service.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {service.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Slug (معرف الرابط) *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="recruitment"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الأيقونة
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  العنوان (عربي) *
                </label>
                <input
                  type="text"
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  العنوان (إنجليزي)
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                الوصف المختصر (عربي) *
              </label>
              <textarea
                name="short_description_ar"
                value={formData.short_description_ar}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                التفاصيل (عربي)
              </label>
              <textarea
                name="details_ar"
                value={formData.details_ar}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                المخرجات
              </label>
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={deliverable}
                    onChange={(e) => handleDeliverableChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مخرج"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliverable}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                + إضافة مخرج
              </button>
            </div>

            {/* Stages */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                مراحل العمل
              </label>
              {formData.stages.map((stage, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => handleStageChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مرحلة"
                  />
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStage}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                + إضافة مرحلة
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                لماذا SCQ؟ (عربي)
              </label>
              <textarea
                name="why_scq_ar"
                value={formData.why_scq_ar}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الترتيب
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">نشط</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{editingService ? 'تحديث' : 'إضافة'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingService(null)
                }}
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition"
              >
                <X className="w-5 h-5" />
                <span>إلغاء</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default ServicesManagementNew
