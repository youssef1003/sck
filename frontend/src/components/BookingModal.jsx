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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/consultation/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">مرحباً بك من جديد!</h2>
            <p className="text-blue-100">احجز استشارتك المجانية الآن</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name */}
          <div className="relative">
            <User className="absolute right-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="الاسم الكامل"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="البريد الإلكتروني"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute right-4 top-4 text-gray-400" size={20} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="رقم الهاتف"
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right"
            />
          </div>

          {/* Company */}
          <div className="relative">
            <Building className="absolute right-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="اسم الشركة (اختياري)"
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right"
            />
          </div>

          {/* Service Type */}
          <div className="relative">
            <FileText className="absolute right-4 top-4 text-gray-400" size={20} />
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              required
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right appearance-none bg-white"
            >
              <option value="">اختر نوع الاستشارة</option>
              <option value="management">استشارات إدارية</option>
              <option value="hr">استشارات الموارد البشرية</option>
              <option value="strategy">التخطيط الاستراتيجي</option>
              <option value="operations">تطوير العمليات</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute right-4 top-4 text-gray-400" size={20} />
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right"
              />
            </div>
            <div className="relative">
              <Clock className="absolute right-4 top-4 text-gray-400" size={20} />
              <select
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right appearance-none bg-white"
              >
                <option value="">الوقت المفضل</option>
                <option value="morning">صباحاً (9-12)</option>
                <option value="afternoon">ظهراً (12-3)</option>
                <option value="evening">مساءً (3-6)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="relative">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="ملاحظات إضافية (اختياري)"
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-right resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'احجز استشارتك المجانية'}
          </button>

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
