import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Eye, Award, Users } from 'lucide-react'

const About = () => {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/page-content?page_key=about')
      const result = await response.json()
      
      if (result.success && result.data) {
        setContent(result.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch about content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Default content if API fails
  const defaultContent = {
    title_ar: 'من نحن',
    description_ar: 'نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة',
    vision_ar: 'أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط تحول كيفية نمو الشركات واتخاذ القرارات',
    mission_ar: 'تقديم حلول إدارية عالية التأثير باستخدام استراتيجيات حديثة وبيانات وتكنولوجيا متقدمة',
    values_ar: ['التميز', 'الشراكة', 'النتائج']
  }

  const data = content || defaultContent

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
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
            {data.title_ar || 'من نحن'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto"
          >
            {data.description_ar || 'نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة'}
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-2xl border border-blue-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">رؤيتنا</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {data.vision_ar || 'أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-50 to-white p-10 rounded-2xl border border-yellow-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">مهمتنا</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {data.mission_ar || 'تقديم حلول إدارية عالية التأثير باستخدام استراتيجيات حديثة'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">منهجيتنا</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نتبع نهجاً منظماً ومبتكراً لضمان تحقيق أفضل النتائج
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'التحليل', desc: 'فهم عميق لأعمالك وتحدياتك' },
              { step: '02', title: 'التخطيط', desc: 'وضع استراتيجية مخصصة' },
              { step: '03', title: 'التنفيذ', desc: 'تطبيق الحلول بفعالية' },
              { step: '04', title: 'المتابعة', desc: 'قياس النتائج والتحسين المستمر' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-secondary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">قيمنا</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {(data.values_ar || ['التميز', 'الشراكة', 'النتائج']).slice(0, 3).map((value, index) => {
              const icons = [Award, Users, Target]
              const Icon = icons[index] || Award
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{value}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
