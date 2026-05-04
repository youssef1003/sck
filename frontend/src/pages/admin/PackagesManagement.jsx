import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, 
  GripVertical, Loader, AlertCircle, Award 
} from 'lucide-react'
import { getPackages, createPackage, updatePackage, deletePackage } from '../../utils/adminApi'

const PackagesManagement = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingPackage, setEditingPackage] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    slug: '',
    name_ar: '',
    name_en: '',
    tier: 'bronze',
    cv_count: 20,
    is_scq_verified: false,
    status_ar: '',
    status_en: '',
    scope_ar: '',
    scope_en: '',
    duration_days: 30,
    features: [''],
    advisory_value_ar: '',
    advisory_value_en: '',
    compatibility_ar: '',
    compatibility_en: '',
    badge_ar: '',
    badge_en: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await getPackages()
      setPackages(response.data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('فشل في تحميل الباقات')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }))
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleEdit = (pkg) => {
    setEditingPackage(pkg)
    setFormData({
      slug: pkg.slug || '',
      name_ar: pkg.name_ar || '',
      name_en: pkg.name_en || '',
      tier: pkg.tier || 'bronze',
      cv_count: pkg.cv_count || 20,
      is_scq_verified: pkg.is_scq_verified || false,
      status_ar: pkg.status_ar || '',
      status_en: pkg.status_en || '',
      scope_ar: pkg.scope_ar || '',
      scope_en: pkg.scope_en || '',
      duration_days: pkg.duration_days || 30,
      features: pkg.features || [''],
      advisory_value_ar: pkg.advisory_value_ar || '',
      advisory_value_en: pkg.advisory_value_en || '',
      compatibility_ar: pkg.compatibility_ar || '',
      compatibility_en: pkg.compatibility_en || '',
      badge_ar: pkg.badge_ar || '',
      badge_en: pkg.badge_en || '',
      is_active: pkg.is_active !== false,
      sort_order: pkg.sort_order || 0
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingPackage(null)
    setFormData({
      slug: '',
      name_ar: '',
      name_en: '',
      tier: 'bronze',
      cv_count: 20,
      is_scq_verified: false,
      status_ar: '',
      status_en: '',
      scope_ar: '',
      scope_en: '',
      duration_days: 30,
      features: [''],
      advisory_value_ar: '',
      advisory_value_en: '',
      compatibility_ar: '',
      compatibility_en: '',
      badge_ar: '',
      badge_en: '',
      is_active: true,
      sort_order: packages.length
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim())
      }

      if (editingPackage) {
        await updatePackage(editingPackage.id, cleanedData)
      } else {
        await createPackage(cleanedData)
      }

      await fetchPackages()
      setShowForm(false)
      setEditingPackage(null)
    } catch (error) {
      console.error('Error saving package:', error)
      setError(error.response?.data?.error || 'فشل في حفظ الباقة')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (pkg) => {
    try {
      await updatePackage(pkg.id, {
        is_active: !pkg.is_active
      })
      await fetchPackages()
    } catch (error) {
      console.error('Error toggling package:', error)
      setError('فشل في تحديث حالة الباقة')
    }
  }

  const handleDelete = async (pkg) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) return

    try {
      await deletePackage(pkg.id)
      await fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      setError('فشل في حذف الباقة')
    }
  }

  const tierOptions = ['bronze', 'silver', 'gold', 'platinum']

  if (loading && packages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">إدارة باقات التوظيف</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة باقة</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Packages List */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الترتيب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المستوى</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">عدد السير</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">محقق</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{pkg.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{pkg.name_ar}</div>
                    <div className="text-sm text-slate-500">{pkg.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 capitalize">{pkg.tier}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{pkg.cv_count}</span>
                  </td>
                  <td className="px-6 py-4">
                    {pkg.is_scq_verified && (
                      <Award className="w-5 h-5 text-purple-600" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pkg.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {pkg.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                        title={pkg.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {pkg.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(pkg)}
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
                  placeholder="bronze-package"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  المستوى *
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {tierOptions.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم (عربي) *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم (إنجليزي) *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  عدد السير الذاتية *
                </label>
                <input
                  type="number"
                  name="cv_count"
                  value={formData.cv_count}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  مدة التسليم (أيام)
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_scq_verified"
                    checked={formData.is_scq_verified}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">SCQ Verified</span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الحالة (عربي)
                </label>
                <input
                  type="text"
                  name="status_ar"
                  value={formData.status_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  النطاق (عربي)
                </label>
                <input
                  type="text"
                  name="scope_ar"
                  value={formData.scope_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                المميزات
              </label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ميزة"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                + إضافة ميزة
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  القيمة الاستشارية (عربي)
                </label>
                <textarea
                  name="advisory_value_ar"
                  value={formData.advisory_value_ar}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  التوافق (عربي)
                </label>
                <textarea
                  name="compatibility_ar"
                  value={formData.compatibility_ar}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الشارة (عربي)
                </label>
                <input
                  type="text"
                  name="badge_ar"
                  value={formData.badge_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
              <div className="flex items-end">
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
                <span>{editingPackage ? 'تحديث' : 'إضافة'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPackage(null)
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

export default PackagesManagement
