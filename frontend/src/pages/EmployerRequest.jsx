import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building, Mail, Phone, User, Users, MapPin, Briefcase, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const EmployerRequest = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    position_title: '',
    number_of_positions: '1',
    job_description: '',
    requirements: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const industries = [
    'تكنولوجيا المعلومات',
    'التجارة والمبيعات',
    'الصناعة',
    'الخدمات المالية',
    'الرعاية الصحية',
    'التعليم',
    'الضيافة والسياحة',
    'البناء والتشييد',
    'النقل واللوجستيات',
    'أخرى'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          message: `طلب توظيف من شركة: ${formData.company_name}
          
الموقع: ${formData.location}
المجال: ${formData.industry}
المسمى الوظيفي: ${formData.position_title}
عدد الوظائف المطلوبة: ${formData.number_of_positions}

الوصف الوظيفي:
${formData.job_description}

المتطلبات:
${formData.requirements}

ملاحظات إضافية:
${formData.notes || 'لا يوجد'}`,
          type: 'employer_request'
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.')
        setFormData({
          company_name: '',
          contact_person: '',
          email: '',
          phone: '',
          location: '',
          industry: '',
          position_title: '',
          number_of_positions: '1',
          job_description: '',
          requirements: '',
          notes: ''
        })
      } else {
        toast.error('حدث خطأ. يرجى المحاولة مرة أخرى.')
      }
    } catch (error) {
      console.error('Employer request error:', error)
      toast.error('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              شكراً لك على اهتمامك. سيتواصل معك فريقنا خلال 24 ساعة لمناقشة احتياجاتك التوظيفية.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              إرسال طلب آخر
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">طلب موظفين</h1>
            <p className="text-xl text-gray-200">
              نساعدك في إيجاد الكفاءات المناسبة لشركتك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info Section */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">معلومات الشركة</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="inline w-4 h-4 ml-1" />
                      اسم الشركة *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="اسم شركتك"
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 ml-1" />
                      اسم المسؤول *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="اسم الشخص المسؤول"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 ml-1" />
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="example@company.com"
                      dir="ltr"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 ml-1" />
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 ml-1" />
                      الموقع *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="المدينة، المنطقة"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="inline w-4 h-4 ml-1" />
                      المجال *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">اختر المجال</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">تفاصيل الوظيفة</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Position Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المسمى الوظيفي *
                    </label>
                    <input
                      type="text"
                      name="position_title"
                      value={formData.position_title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="مثال: مدير مبيعات"
                    />
                  </div>

                  {/* Number of Positions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 ml-1" />
                      عدد الوظائف المطلوبة *
                    </label>
                    <input
                      type="number"
                      name="number_of_positions"
                      value={formData.number_of_positions}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 ml-1" />
                    الوصف الوظيفي *
                  </label>
                  <textarea
                    name="job_description"
                    value={formData.job_description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="اكتب وصفاً تفصيلياً للوظيفة والمهام المطلوبة..."
                  />
                </div>

                {/* Requirements */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المتطلبات والمؤهلات *
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="المؤهلات، الخبرات، المهارات المطلوبة..."
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="أي معلومات إضافية تود إضافتها..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default EmployerRequest
