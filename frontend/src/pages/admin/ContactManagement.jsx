import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, MapPin, Phone, Mail, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const ContactManagement = () => {
  const [contactData, setContactData] = useState({
    // Egypt Office
    egypt_address_ar: 'القاهرة، مصر',
    egypt_address_en: 'Cairo, Egypt',
    egypt_phone: '+20 123 456 7890',
    egypt_email: 'egypt@scq.com',
    
    // Saudi Office
    saudi_address_ar: 'الرياض، المملكة العربية السعودية',
    saudi_address_en: 'Riyadh, Saudi Arabia',
    saudi_phone: '+966 50 123 4567',
    saudi_email: 'saudi@scq.com',
    
    // General Contact
    general_email: 'info@scq.com',
    support_email: 'support@scq.com',
    whatsapp: '+966 50 123 4567',
    
    // Social Media
    facebook: 'https://facebook.com/scq',
    twitter: 'https://twitter.com/scq',
    linkedin: 'https://linkedin.com/company/scq',
    instagram: 'https://instagram.com/scq',
    
    // Working Hours
    working_hours_ar: 'الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً',
    working_hours_en: 'Sunday - Thursday: 9:00 AM - 5:00 PM',
    
    // Map Links
    egypt_map_link: 'https://maps.google.com',
    saudi_map_link: 'https://maps.google.com'
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load saved data from localStorage
    const saved = localStorage.getItem('contact_data')
    if (saved) {
      try {
        setContactData(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load contact data:', error)
      }
    }
  }, [])

  const handleChange = (field, value) => {
    setContactData({ ...contactData, [field]: value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage for now (will be connected to API later)
      localStorage.setItem('contact_data', JSON.stringify(contactData))
      
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
          <h1 className="text-3xl font-bold text-slate-900">إدارة صفحة "تواصل معنا"</h1>
          <p className="text-slate-600 mt-2">تعديل معلومات الاتصال والمكاتب</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Egypt Office */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">مكتب مصر</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (عربي)
              </label>
              <input
                type="text"
                value={contactData.egypt_address_ar}
                onChange={(e) => handleChange('egypt_address_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (English)
              </label>
              <input
                type="text"
                value={contactData.egypt_address_en}
                onChange={(e) => handleChange('egypt_address_en', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={contactData.egypt_phone}
                onChange={(e) => handleChange('egypt_phone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={contactData.egypt_email}
                onChange={(e) => handleChange('egypt_email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رابط الخريطة
              </label>
              <input
                type="url"
                value={contactData.egypt_map_link}
                onChange={(e) => handleChange('egypt_map_link', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </motion.div>

        {/* Saudi Office */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">مكتب السعودية</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (عربي)
              </label>
              <input
                type="text"
                value={contactData.saudi_address_ar}
                onChange={(e) => handleChange('saudi_address_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                العنوان (English)
              </label>
              <input
                type="text"
                value={contactData.saudi_address_en}
                onChange={(e) => handleChange('saudi_address_en', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={contactData.saudi_phone}
                onChange={(e) => handleChange('saudi_phone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={contactData.saudi_email}
                onChange={(e) => handleChange('saudi_email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رابط الخريطة
              </label>
              <input
                type="url"
                value={contactData.saudi_map_link}
                onChange={(e) => handleChange('saudi_map_link', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </motion.div>

        {/* General Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">معلومات الاتصال العامة</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                البريد الإلكتروني العام
              </label>
              <input
                type="email"
                value={contactData.general_email}
                onChange={(e) => handleChange('general_email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                بريد الدعم الفني
              </label>
              <input
                type="email"
                value={contactData.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                رقم الواتساب
              </label>
              <input
                type="text"
                value={contactData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ساعات العمل (عربي)
              </label>
              <input
                type="text"
                value={contactData.working_hours_ar}
                onChange={(e) => handleChange('working_hours_ar', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ساعات العمل (English)
              </label>
              <input
                type="text"
                value={contactData.working_hours_en}
                onChange={(e) => handleChange('working_hours_en', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Globe className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">وسائل التواصل الاجتماعي</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={contactData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={contactData.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={contactData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={contactData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </motion.div>
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

export default ContactManagement
