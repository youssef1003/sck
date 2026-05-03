
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { CheckCircle, Loader, AlertCircle, ChevronRight, ChevronLeft, User, FileText, Shield, GraduationCap, Briefcase, Award, DollarSign } from 'lucide-react'

const CandidateRegister = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Contact Info
    full_name: '',
    national_id: '',
    mobile: '',
    email: '',
    // Step 2: Basic Info
    nationality: '',
    gender: '',
    age: '',
    marital_status: '',
    has_driving_license: false,
    owns_car: false,
    country: 'السعودية',
    city: '',
    district: '',
    // Step 3: Legal & Administrative Status
    military_status: '',
    has_previous_court_judgments: false,
    has_criminal_record_document: false,
    registered_in_social_insurance: false,
    has_labor_cases: false,
    // Step 4: Education
    education_level: '',
    education_specialization: '',
    functional_sector: '',
    current_job_title: '',
    total_experience_years: '',
    // Step 5: Work Experiences (up to 4)
    experiences: [],
    // Step 6: Skills & Competencies
    languages: [],
    computer_skills: {
      excel: '',
      word: '',
      powerpoint: ''
    },
    // Step 7: Salary
    current_salary: '',
    expected_salary: ''
  })

  const [errors, setErrors] = useState({})

  const steps = [
    { number: 1, title: 'بيانات الاتصال', icon: User },
    { number: 2, title: 'البيانات الأساسية', icon: FileText },
    { number: 3, title: 'الحالة القانونية والإدارية', icon: Shield },
    { number: 4, title: 'البيانات العلمية', icon: GraduationCap },
    { number: 5, title: 'الخبرات العملية', icon: Briefcase },
    { number: 6, title: 'المهارات والجدارة', icon: Award },
    { number: 7, title: 'الراتب والمراجعة', icon: DollarSign }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleComputerSkillChange = (skill, level) => {
    setFormData(prev => ({
      ...prev,
      computer_skills: {
        ...prev.computer_skills,
        [skill]: level
      }
    }))
  }

  const addExperience = () => {
    if (formData.experiences.length < 4) {
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, {
          company_name: '',
          job_title: '',
          job_tasks: '',
          from_date: '',
          to_date: ''
        }]
      }))
    }
  }

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addLanguage = () => {
    if (formData.languages.length < 3) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { language: '', level: '' }]
      }))
    }
  }

  const removeLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateLanguage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    switch(step) {
      case 1: // Contact Info
        if (!formData.full_name.trim()) newErrors.full_name = 'الاسم الكامل مطلوب'
        if (!formData.national_id.trim()) newErrors.national_id = 'رقم الهوية مطلوب'
        if (!formData.mobile.trim()) newErrors.mobile = 'رقم الجوال مطلوب'
        if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح'
        break
      
      case 2: // Basic Info
        if (!formData.nationality.trim()) newErrors.nationality = 'الجنسية مطلوبة'
        if (!formData.gender) newErrors.gender = 'الجنس مطلوب'
        if (!formData.city.trim()) newErrors.city = 'المدينة مطلوبة'
        break
      
      case 3: // Legal & Administrative - no required fields
        break
      
      case 4: // Education
        if (!formData.education_level) newErrors.education_level = 'المستوى التعليمي مطلوب'
        if (!formData.functional_sector.trim()) newErrors.functional_sector = 'القطاع الوظيفي مطلوب'
        break
      
      case 5: // Work Experiences - optional
        break
      
      case 6: // Skills - optional
        break
      
      case 7: // Salary & Review - optional
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(7)) return

    setLoading(true)
    setError(null)

    try {
      // Prepare data for API (exclude verification_status, premium_badge, admin_notes)
      const submitData = {
        full_name: formData.full_name,
        national_id: formData.national_id,
        mobile: formData.mobile,
        email: formData.email,
        nationality: formData.nationality,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        marital_status: formData.marital_status,
        has_driving_license: formData.has_driving_license,
        owns_car: formData.owns_car,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        military_status: formData.military_status,
        has_previous_court_judgments: formData.has_previous_court_judgments,
        has_criminal_record_document: formData.has_criminal_record_document,
        registered_in_social_insurance: formData.registered_in_social_insurance,
        has_labor_cases: formData.has_labor_cases,
        education_level: formData.education_level,
        education_specialization: formData.education_specialization,
        functional_sector: formData.functional_sector,
        current_job_title: formData.current_job_title,
        total_experience_years: formData.total_experience_years ? parseInt(formData.total_experience_years) : null,
        current_salary: formData.current_salary ? parseFloat(formData.current_salary) : null,
        expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : null,
        experiences: formData.experiences,
        languages: formData.languages,
        computer_skills: formData.computer_skills
      }

      await axios.post('/api/candidates', submitData)
      setSuccess(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (error) {
      console.error('Error submitting candidate:', error)
      setError(error.response?.data?.error || 'فشل في إرسال البيانات')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white pt-24">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">تم التسجيل بنجاح!</h2>
          <p className="text-lg text-slate-600 mb-6">شكراً لتسجيلك في قاعدة بياناتنا. سيتم مراجعة بياناتك والتواصل معك عند توفر فرص مناسبة.</p>
          <p className="text-sm text-slate-500">سيتم تحويلك إلى الصفحة الرئيسية...</p>
        </motion.div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>ملاحظة:</strong> بيانات الاتصال محجوبة ولا تظهر إلا لإدارة SCQ.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الاسم الكامل *</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="أدخل الاسم الكامل"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رقم الهوية *</label>
                <input 
                  type="text" 
                  name="national_id" 
                  value={formData.national_id} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.national_id ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="أدخل رقم الهوية"
                />
                {errors.national_id && <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رقم الجوال *</label>
                <input 
                  type="tel" 
                  name="mobile" 
                  value={formData.mobile} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.mobile ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="05xxxxxxxx"
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">البريد الإلكتروني *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الجنسية *</label>
                <input 
                  type="text" 
                  name="nationality" 
                  value={formData.nationality} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nationality ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="مثال: سعودي"
                />
                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الجنس *</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : 'border-slate-300'}`}
                >
                  <option value="">اختر</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">العمر</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="مثال: 30"
                  min="18"
                  max="70"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الحالة الاجتماعية</label>
                <select 
                  name="marital_status" 
                  value={formData.marital_status} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر</option>
                  <option value="أعزب">أعزب</option>
                  <option value="متزوج">متزوج</option>
                  <option value="مطلق">مطلق</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رخصة القيادة</label>
                <select 
                  name="has_driving_license" 
                  value={formData.has_driving_license} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">امتلاك سيارة</label>
                <select 
                  name="owns_car" 
                  value={formData.owns_car} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الدولة</label>
                <input 
                  type="text" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">المدينة *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="مثال: الرياض"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الحي</label>
                <input 
                  type="text" 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="مثال: العليا"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الموقف من التجنيد</label>
                <select 
                  name="military_status" 
                  value={formData.military_status} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر</option>
                  <option value="أدى الخدمة">أدى الخدمة</option>
                  <option value="إعفاء">إعفاء</option>
                  <option value="تأجيل">تأجيل</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">أحكام قضائية سابقة</label>
                <select 
                  name="has_previous_court_judgments" 
                  value={formData.has_previous_court_judgments} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">صحيفة جنائية</label>
                <select 
                  name="has_criminal_record_document" 
                  value={formData.has_criminal_record_document} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">مسجل في التأمينات الاجتماعية</label>
                <select 
                  name="registered_in_social_insurance" 
                  value={formData.registered_in_social_insurance} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">قضايا عمالية</label>
                <select 
                  name="has_labor_cases" 
                  value={formData.has_labor_cases} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={false}>لا</option>
                  <option value={true}>نعم</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">المستوى التعليمي *</label>
                <select 
                  name="education_level" 
                  value={formData.education_level} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.education_level ? 'border-red-500' : 'border-slate-300'}`}
                >
                  <option value="">اختر</option>
                  <option value="دبلوم">دبلوم</option>
                  <option value="بكالوريوس">بكالوريوس</option>
                  <option value="ماجستير">ماجستير</option>
                  <option value="دكتوراه">دكتوراه</option>
                </select>
                {errors.education_level && <p className="text-red-500 text-sm mt-1">{errors.education_level}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">التخصص</label>
                <input 
                  type="text" 
                  name="education_specialization" 
                  value={formData.education_specialization} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="مثال: إدارة أعمال"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">القطاع الوظيفي *</label>
                <input 
                  type="text" 
                  name="functional_sector" 
                  value={formData.functional_sector} 
                  onChange={handleChange} 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.functional_sector ? 'border-red-500' : 'border-slate-300'}`} 
                  placeholder="مثال: الموارد البشرية"
                />
                {errors.functional_sector && <p className="text-red-500 text-sm mt-1">{errors.functional_sector}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">المسمى الوظيفي الحالي</label>
                <input 
                  type="text" 
                  name="current_job_title" 
                  value={formData.current_job_title} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="مثال: مدير موارد بشرية"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">سنوات الخبرة</label>
                <select 
                  name="total_experience_years" 
                  value={formData.total_experience_years} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                  <option value="20">20+</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-600">يمكنك إضافة حتى 4 خبرات عملية</p>
              {formData.experiences.length < 4 && (
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + إضافة خبرة
                </button>
              )}
            </div>
            
            {formData.experiences.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">لم تضف أي خبرات عملية بعد</p>
                <button
                  type="button"
                  onClick={addExperience}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة خبرة عملية
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.experiences.map((exp, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900">خبرة {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">اسم الشركة</label>
                        <input
                          type="text"
                          value={exp.company_name}
                          onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: شركة ABC"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">المسمى الوظيفي</label>
                        <input
                          type="text"
                          value={exp.job_title}
                          onChange={(e) => updateExperience(index, 'job_title', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="مثال: مدير مشروع"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">من تاريخ</label>
                        <input
                          type="date"
                          value={exp.from_date}
                          onChange={(e) => updateExperience(index, 'from_date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">إلى تاريخ</label>
                        <input
                          type="date"
                          value={exp.to_date}
                          onChange={(e) => updateExperience(index, 'to_date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-700 font-semibold mb-2">المهام الوظيفية</label>
                        <textarea
                          value={exp.job_tasks}
                          onChange={(e) => updateExperience(index, 'job_tasks', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="اذكر المهام والمسؤوليات الرئيسية"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            {/* Languages */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">اللغات</h3>
                {formData.languages.length < 3 && (
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + إضافة لغة
                  </button>
                )}
              </div>
              
              {formData.languages.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600 mb-3">لم تضف أي لغات بعد</p>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إضافة لغة
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-900">لغة {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                        >
                          حذف
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">اللغة</label>
                          <select
                            value={lang.language}
                            onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">اختر</option>
                            <option value="عربي">عربي</option>
                            <option value="إنجليزي">إنجليزي</option>
                            <option value="فرنسي">فرنسي</option>
                            <option value="ألماني">ألماني</option>
                            <option value="إسباني">إسباني</option>
                            <option value="صيني">صيني</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold mb-2">المستوى</label>
                          <select
                            value={lang.level}
                            onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">اختر</option>
                            <option value="متوسط">متوسط</option>
                            <option value="جيد">جيد</option>
                            <option value="جيد جدا">جيد جدا</option>
                            <option value="ممتاز">ممتاز</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Computer Skills */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">المهارات الحاسوبية</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-2">Excel</label>
                  <select
                    value={formData.computer_skills.excel}
                    onChange={(e) => handleComputerSkillChange('excel', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="جيد">جيد</option>
                    <option value="جيد جدا">جيد جدا</option>
                    <option value="ممتاز">ممتاز</option>
                  </select>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-2">Word</label>
                  <select
                    value={formData.computer_skills.word}
                    onChange={(e) => handleComputerSkillChange('word', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="جيد">جيد</option>
                    <option value="جيد جدا">جيد جدا</option>
                    <option value="ممتاز">ممتاز</option>
                  </select>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-slate-700 font-semibold mb-2">PowerPoint</label>
                  <select
                    value={formData.computer_skills.powerpoint}
                    onChange={(e) => handleComputerSkillChange('powerpoint', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="جيد">جيد</option>
                    <option value="جيد جدا">جيد جدا</option>
                    <option value="ممتاز">ممتاز</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-8">
            {/* Salary */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">معلومات الراتب</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">الراتب الحالي (ريال)</label>
                  <input 
                    type="number" 
                    name="current_salary" 
                    value={formData.current_salary} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="مثال: 10000"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">الراتب المتوقع (ريال)</label>
                  <input 
                    type="number" 
                    name="expected_salary" 
                    value={formData.expected_salary} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="مثال: 15000"
                  />
                </div>
              </div>
            </div>

            {/* Review Summary */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">مراجعة البيانات</h3>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 font-semibold">الاسم الكامل:</p>
                    <p className="text-slate-900">{formData.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">البريد الإلكتروني:</p>
                    <p className="text-slate-900">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">الجنسية:</p>
                    <p className="text-slate-900">{formData.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">المدينة:</p>
                    <p className="text-slate-900">{formData.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">المستوى التعليمي:</p>
                    <p className="text-slate-900">{formData.education_level || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">القطاع الوظيفي:</p>
                    <p className="text-slate-900">{formData.functional_sector || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">سنوات الخبرة:</p>
                    <p className="text-slate-900">{formData.total_experience_years || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">الراتب المتوقع:</p>
                    <p className="text-slate-900">{formData.expected_salary ? `${formData.expected_salary} ريال` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">عدد الخبرات:</p>
                    <p className="text-slate-900">{formData.experiences.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold">عدد اللغات:</p>
                    <p className="text-slate-900">{formData.languages.length}</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700">
                    <strong>ملاحظة:</strong> بالضغط على "إرسال الطلب" أدناه، أنت توافق على صحة البيانات المقدمة وتمنح SCQ الإذن بمراجعة بياناتك والتواصل معك عند توفر فرص مناسبة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-24" dir="rtl">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">تسجيل مرشح</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">سجل بياناتك للانضمام إلى قاعدة بياناتنا</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep === step.number 
                        ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                    </div>
                    <p className={`text-xs mt-2 text-center hidden md:block ${
                      currentStep === step.number ? 'text-blue-600 font-bold' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center md:hidden">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-blue-600">{steps[currentStep - 1].title}</span>
                <span className="text-slate-400"> ({currentStep} من {steps.length})</span>
              </p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                {React.createElement(steps[currentStep - 1].icon, { className: "w-8 h-8 text-blue-600" })}
                <h2 className="text-3xl font-bold text-slate-900">{steps[currentStep - 1].title}</h2>
              </div>
              
              {renderStepContent()}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
                <span>السابق</span>
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CandidateRegister
