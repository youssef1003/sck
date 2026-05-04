import { useState } from 'react'
import { X, Calendar, Clock, User, Mail, Phone, Building, FileText } from 'lucide-react'

export default function BookingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Map form fields to API expected format
      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        serviceType: formData.service_type,
        preferredDate: formData.preferred_date,
        preferredTime: formData.preferred_time,
        notes: formData.notes
      }

      const apiUrl = '' // Force Vercel API
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            service_type: '',
            preferred_date: '',
            preferred_time: '',
            notes: ''
          })
          setSubmitStatus(null)
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - VERY Large and Visible */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 left-3 z-50 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="إغلاق"
        >
          <X size={28} strokeWidth={3} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 rounded-t-2xl">
          <div className="text-center pr-12">
            <h2 className="text-3xl font-bold mb-2">احجز استشارتك المجانية</h2>
            <p className="text-blue-100">املأ النموذج وسنتواصل معك قريباً</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gradient-to-br from-blue-50/30 to-cyan-50/30">
          {/* Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الاسم الكامل *
            </label>
            <User className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right bg-white"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              البريد الإلكتروني *
            </label>
            <Mail className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right bg-white"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              رقم الهاتف *
            </label>
            <Phone className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+966 5XX XXX XXX"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right bg-white"
            />
          </div>

          {/* Company */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              اسم الشركة (اختياري)
            </label>
            <Building className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="اسم شركتك"
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right bg-white"
            />
          </div>

          {/* Service Type */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              نوع الاستشارة *
            </label>
            <FileText className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right appearance-none bg-white"
            >
              <option value="">اختر نوع الاستشارة</option>
              <option value="feasibility">دراسات الجدوى الاقتصادية</option>
              <option value="strategic">التخطيط الاستراتيجي</option>
              <option value="organizational">البناء المؤسسي</option>
              <option value="hr">الموارد البشرية</option>
              <option value="iso">تأهيل ISO</option>
              <option value="business">تأسيس الشركات</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                التاريخ المفضل
              </label>
              <Calendar className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right bg-white"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                الوقت المفضل
              </label>
              <Clock className="absolute right-4 top-11 text-gray-400 pointer-events-none" size={20} />
              <select
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right appearance-none bg-white"
              >
                <option value="">اختر الوقت</option>
                <option value="morning">صباحاً (9-12)</option>
                <option value="afternoon">ظهراً (12-3)</option>
                <option value="evening">مساءً (3-6)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أخبرنا المزيد عن احتياجاتك..."
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right resize-none bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg transition border-2 border-gray-300"
            >
              ✕ إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'جاري الإرسال...' : '✓ إرسال الطلب'}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-center">
              تم إرسال طلبك بنجاح! سنتواصل معك قريباً
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center">
              حدث خطأ، يرجى المحاولة مرة أخرى
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
