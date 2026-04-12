import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Target, Upload, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Careers = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriod: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
    resume: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [employeeCode, setEmployeeCode] = useState('')

  const benefits = [
    {
      icon: TrendingUp,
      key: 'growth'
    },
    {
      icon: Users,
      key: 'culture'
    },
    {
      icon: Award,
      key: 'benefits'
    },
    {
      icon: Target,
      key: 'impact'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    
    if (file && allowedTypes.includes(file.type)) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }))
    } else {
      alert(isRTL 
        ? 'يرجى رفع ملف PDF أو Word أو صورة فقط' 
        : 'Please upload PDF, Word, or Image file only')
    }
  }

  const generateEmployeeCode = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 7)
    return `EMP-${timestamp}-${random}`.toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const code = generateEmployeeCode()
      const applicationData = {
        id: Date.now(),
        ...formData,
        employeeCode: code,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }

      // Save to localStorage (temporary - will be replaced with API)
      const existing = JSON.parse(localStorage.getItem('scq_applications') || '[]')
      existing.push(applicationData)
      localStorage.setItem('scq_applications', JSON.stringify(existing))

      setEmployeeCode(code)
      setSubmitSuccess(true)
      setIsSubmitting(false)
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          education: '',
          currentCompany: '',
          expectedSalary: '',
          noticePeriod: '',
          linkedin: '',
          portfolio: '',
          coverLetter: '',
          resume: null
        })
      }, 5000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>

        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {t('careers.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {t('careers.subtitle')}
            </p>
            <p className="text-lg text-blue-200/80">
              {t('careers.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {t('careers.why_join.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t(`careers.why_join.${benefit.key}.title`)}
                </h3>
                <p className="text-slate-600">
                  {t(`careers.why_join.${benefit.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-blue-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  {t('careers.application.title')}
                </h2>
                <p className="text-slate-600">
                  {isRTL 
                    ? 'املأ النموذج أدناه وسنتواصل معك قريباً' 
                    : 'Fill out the form below and we will contact you soon'}
                </p>
              </div>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex p-6 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {t('careers.application.success')}
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6 mb-4 max-w-md mx-auto">
                    <p className="text-sm text-slate-600 mb-2">
                      {isRTL ? 'كود المتقدم الخاص بك:' : 'Your Application Code:'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                      {employeeCode}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {isRTL 
                        ? 'احتفظ بهذا الكود للمتابعة' 
                        : 'Keep this code for follow-up'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('careers.application.name')} *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('careers.application.email')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('careers.application.phone')} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('careers.application.position')} *
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder={isRTL ? 'مثال: مستشار أعمال' : 'e.g., Business Consultant'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'سنوات الخبرة' : 'Years of Experience'} *
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                        <option value="0-1">{isRTL ? 'أقل من سنة' : 'Less than 1 year'}</option>
                        <option value="1-3">1-3 {t('careers.years')}</option>
                        <option value="3-5">3-5 {t('careers.years')}</option>
                        <option value="5-7">5-7 {t('careers.years')}</option>
                        <option value="7-10">7-10 {t('careers.years')}</option>
                        <option value="10+">{isRTL ? 'أكثر من 10 سنوات' : '10+ years'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'المؤهل الدراسي' : 'Education'}
                      </label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                        <option value="high-school">{isRTL ? 'ثانوية عامة' : 'High School'}</option>
                        <option value="diploma">{isRTL ? 'دبلوم' : 'Diploma'}</option>
                        <option value="bachelor">{isRTL ? 'بكالوريوس' : 'Bachelor\'s Degree'}</option>
                        <option value="master">{isRTL ? 'ماجستير' : 'Master\'s Degree'}</option>
                        <option value="phd">{isRTL ? 'دكتوراه' : 'PhD'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'الشركة الحالية' : 'Current Company'}
                      </label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'الراتب المتوقع' : 'Expected Salary'}
                      </label>
                      <input
                        type="text"
                        name="expectedSalary"
                        value={formData.expectedSalary}
                        onChange={handleInputChange}
                        placeholder={isRTL ? 'مثال: 10000 ريال' : 'e.g., 10000 SAR'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'فترة الإشعار' : 'Notice Period'}
                      </label>
                      <select
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                        <option value="immediate">{isRTL ? 'فوري' : 'Immediate'}</option>
                        <option value="1-week">{isRTL ? 'أسبوع' : '1 Week'}</option>
                        <option value="2-weeks">{isRTL ? 'أسبوعين' : '2 Weeks'}</option>
                        <option value="1-month">{isRTL ? 'شهر' : '1 Month'}</option>
                        <option value="2-months">{isRTL ? 'شهرين' : '2 Months'}</option>
                        <option value="3-months">{isRTL ? '3 أشهر' : '3 Months'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        LinkedIn {isRTL ? 'الملف الشخصي' : 'Profile'}
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isRTL ? 'رابط معرض الأعمال' : 'Portfolio Link'}
                      </label>
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('careers.application.resume')} *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                        required
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center justify-center gap-3 w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50"
                      >
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-slate-600">
                          {formData.resume 
                            ? formData.resume.name 
                            : (isRTL ? 'اضغط لرفع السيرة الذاتية (PDF, Word, صورة)' : 'Click to upload resume (PDF, Word, Image)')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('careers.application.cover_letter')}
                    </label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder={isRTL 
                        ? 'أخبرنا عن نفسك ولماذا تريد الانضمام إلى فريقنا...' 
                        : 'Tell us about yourself and why you want to join our team...'}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting 
                        ? t('careers.application.submitting') 
                        : t('careers.application.submit')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Careers
