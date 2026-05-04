import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Users,
  Target,
  CheckCircle,
  Loader,
  AlertCircle
} from 'lucide-react'

const QuoteRequest = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPackage = searchParams.get('package')

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    representative_name: '',
    representative_role: '',
    company_name: '',
    company_size: '',
    company_activity: '',
    vacancy_nature: '',
    challenges: [],
    employees_needed: '',
    required_professions: [],
    selected_package_slug: preselectedPackage || '',
    mobile: '',
    email: ''
  })

  const [professionInput, setProfessionInput] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/api/recruitment-packages')
      setPackages(response.data.data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const companySizes = [
    'أقل من 10 موظفين',
    '10-50 موظف',
    '51-200 موظف',
    '201-500 موظف',
    'أكثر من 500 موظف'
  ]

  const vacancyNatures = [
    'وظيفة دائمة',
    'وظيفة مؤقتة',
    'عقد مشروع',
    'دوام جزئي',
    'عن بعد'
  ]

  const commonChallenges = [
    'صعوبة في إيجاد المرشحين المؤهلين',
    'ارتفاع تكاليف التوظيف',
    'طول مدة عملية التوظيف',
    'نقص الخبرة في التقييم الفني',
    'صعوبة في التحقق من المؤهلات',
    'ارتفاع معدل دوران الموظفين'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleChallengeToggle = (challenge) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }))
  }

  const handleAddProfession = () => {
    if (professionInput.trim() && !formData.required_professions.includes(professionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        required_professions: [...prev.required_professions, professionInput.trim()]
      }))
      setProfessionInput('')
    }
  }

  const handleRemoveProfession = (profession) => {
    setFormData(prev => ({
      ...prev,
      required_professions: prev.required_professions.filter(p => p !== profession)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.representative_name.trim()) {
      newErrors.representative_name = 'الاسم مطلوب'
    }
    if (!formData.representative_role.trim()) {
      newErrors.representative_role = 'المسمى الوظيفي مطلوب'
    }
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'اسم الشركة مطلوب'
    }
    if (!formData.company_size) {
      newErrors.company_size = 'حجم الشركة مطلوب'
    }
    if (!formData.company_activity.trim()) {
      newErrors.company_activity = 'نشاط الشركة مطلوب'
    }
    if (!formData.vacancy_nature) {
      newErrors.vacancy_nature = 'طبيعة الوظيفة مطلوبة'
    }
    if (!formData.employees_needed || formData.employees_needed < 1) {
      newErrors.employees_needed = 'عدد الموظفين المطلوبين يجب أن يكون 1 على الأقل'
    }
    if (formData.required_professions.length === 0) {
      newErrors.required_professions = 'يجب إضافة تخصص واحد على الأقل'
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'رقم الجوال مطلوب'
    } else if (!/^(05|5)[0-9]{8}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'رقم الجوال غير صحيح'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await axios.post('/api/quote-requests', formData)
      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Error submitting quote request:', error)
      setError(error.response?.data?.error || 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            سيتواصل معك فريقنا خلال 24 ساعة لمناقشة احتياجاتك وتقديم عرض السعر المناسب
          </p>
          <p className="text-sm text-slate-500">
            جاري التحويل إلى الصفحة الرئيسية...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            طلب عرض سعر
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            املأ النموذج أدناه وسيتواصل معك فريقنا لتقديم عرض سعر مخصص لاحتياجاتك
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Section 1: Representative Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                معلومات المسؤول
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="representative_name"
                    value={formData.representative_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.representative_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="أدخل اسمك الكامل"
                  />
                  {errors.representative_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.representative_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    المسمى الوظيفي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="representative_role"
                    value={formData.representative_role}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.representative_role ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="مثال: مدير الموارد البشرية"
                  />
                  {errors.representative_role && (
                    <p className="text-red-500 text-sm mt-1">{errors.representative_role}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Company Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                معلومات الشركة
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    اسم الشركة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.company_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="أدخل اسم الشركة"
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      حجم الشركة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.company_size ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">اختر حجم الشركة</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    {errors.company_size && (
                      <p className="text-red-500 text-sm mt-1">{errors.company_size}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      نشاط الشركة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_activity"
                      value={formData.company_activity}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.company_activity ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="مثال: تقنية المعلومات"
                    />
                    {errors.company_activity && (
                      <p className="text-red-500 text-sm mt-1">{errors.company_activity}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Vacancy Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                تفاصيل الوظيفة
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      طبيعة الوظيفة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vacancy_nature"
                      value={formData.vacancy_nature}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vacancy_nature ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">اختر طبيعة الوظيفة</option>
                      {vacancyNatures.map(nature => (
                        <option key={nature} value={nature}>{nature}</option>
                      ))}
                    </select>
                    {errors.vacancy_nature && (
                      <p className="text-red-500 text-sm mt-1">{errors.vacancy_nature}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">
                      عدد الموظفين المطلوبين <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="employees_needed"
                      value={formData.employees_needed}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.employees_needed ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="مثال: 5"
                    />
                    {errors.employees_needed && (
                      <p className="text-red-500 text-sm mt-1">{errors.employees_needed}</p>
                    )}
                  </div>
                </div>

                {/* Required Professions */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    التخصصات المطلوبة <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={professionInput}
                      onChange={(e) => setProfessionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProfession())}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: مطور برمجيات"
                    />
                    <button
                      type="button"
                      onClick={handleAddProfession}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      إضافة
                    </button>
                  </div>
                  {formData.required_professions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.required_professions.map((profession, index) => (
                        <div
                          key={index}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2"
                        >
                          <span>{profession}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProfession(profession)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.required_professions && (
                    <p className="text-red-500 text-sm mt-1">{errors.required_professions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Challenges */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                التحديات التي تواجهها (اختياري)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {commonChallenges.map(challenge => (
                  <label
                    key={challenge}
                    className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.challenges.includes(challenge)}
                      onChange={() => handleChallengeToggle(challenge)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 5: Package Selection */}
            {packages.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  اختر الباقة (اختياري)
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {packages.map(pkg => (
                    <label
                      key={pkg.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.selected_package_slug === pkg.slug
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selected_package_slug"
                        value={pkg.slug}
                        checked={formData.selected_package_slug === pkg.slug}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{pkg.name_ar}</div>
                        <div className="text-sm text-slate-600">{pkg.cv_count} سيرة ذاتية</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Contact Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-600" />
                معلومات التواصل
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    رقم الجوال <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobile ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="05xxxxxxxx"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="example@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>إرسال الطلب</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default QuoteRequest
