import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            تواصل معنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto"
          >
            نحن هنا لمساعدتك. تواصل معنا اليوم وابدأ رحلة النجاح
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">معلومات التواصل</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                تواصل معنا عبر أي من القنوات التالية، وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن
              </p>

              <div className="space-y-6">
                {/* Egypt Office */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-primary mb-4 flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl">🇪🇬</span>
                    <span>مكتب مصر</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <MapPin size={18} className="text-secondary" />
                      <span>القاهرة، مصر</span>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <Phone size={18} className="text-secondary" />
                      <span dir="ltr">+20 123 456 7890</span>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <Mail size={18} className="text-secondary" />
                      <span>egypt@sck-consulting.com</span>
                    </div>
                  </div>
                </div>

                {/* Saudi Office */}
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                  <h3 className="font-bold text-primary mb-4 flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl">🇸🇦</span>
                    <span>مكتب السعودية</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <MapPin size={18} className="text-secondary" />
                      <span>الرياض، السعودية</span>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <Phone size={18} className="text-secondary" />
                      <span dir="ltr">+966 50 123 4567</span>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse text-gray-700">
                      <Mail size={18} className="text-secondary" />
                      <span>saudi@sck-consulting.com</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <button className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                  <MessageCircle size={20} />
                  <span>تواصل عبر واتساب</span>
                </button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200">
                <h2 className="text-3xl font-bold text-primary mb-6">أرسل لنا رسالة</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                      placeholder="أدخل اسمك"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                      placeholder="+20 123 456 7890"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">نوع العمل</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                      required
                    >
                      <option value="">اختر نوع العمل</option>
                      <option value="startup">شركة ناشئة</option>
                      <option value="sme">شركة صغيرة أو متوسطة</option>
                      <option value="corporate">شركة كبيرة</option>
                      <option value="individual">فرد</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">رسالتك</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all resize-none"
                      placeholder="أخبرنا كيف يمكننا مساعدتك..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-secondary to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    <span>إرسال الرسالة</span>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
