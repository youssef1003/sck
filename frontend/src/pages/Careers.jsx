import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, Target, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Careers = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

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

    // Applications temporarily disabled - need backend API
    setTimeout(() => {
      setIsSubmitting(false)
      alert(isRTL 
        ? 'عذراً، نظام التقديم على الوظائف قيد التطوير حالياً. يرجى التواصل معنا مباشرة عبر صفحة "تواصل معنا".'
        : 'Sorry, the job application system is currently under development. Please contact us directly via the "Contact Us" page.')
    }, 1000)
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
            {/* Applications temporarily unavailable */}
            <div className="bg-white rounded-2xl shadow-xl p-12 border-2 border-blue-100 text-center">
              <div className="inline-flex p-6 rounded-full bg-blue-100 mb-6">
                <Briefcase className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {isRTL ? 'التقديم على الوظائف' : 'Job Applications'}
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                {isRTL 
                  ? 'نظام التقديم على الوظائف قيد التطوير حالياً. للتقديم على الوظائف، يرجى التواصل معنا مباشرة.'
                  : 'The job application system is currently under development. To apply for jobs, please contact us directly.'}
              </p>
              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <p className="text-sm text-slate-600 mb-2">
                  {isRTL ? '💡 كيف تتقدم؟' : '💡 How to Apply?'}
                </p>
                <p className="text-slate-700">
                  {isRTL 
                    ? 'يمكنك إرسال سيرتك الذاتية ومعلومات التواصل عبر صفحة "تواصل معنا" وسنتواصل معك قريباً.'
                    : 'You can send your CV and contact information via the "Contact Us" page and we will get back to you soon.'}
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg"
              >
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Careers
