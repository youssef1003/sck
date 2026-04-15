import { motion } from 'framer-motion'
import { Target, Eye, Award, Users } from 'lucide-react'

const About = () => {
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
            من نحن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto"
          >
            نحن في SCQ نؤمن بأن كل شركة لديها القدرة على النمو مع الاستراتيجية الصحيحة
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
                أن نصبح منصة استشارات رقمية رائدة في الشرق الأوسط تحول كيفية نمو الشركات واتخاذ القرارات
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
                تقديم حلول إدارية عالية التأثير باستخدام استراتيجيات حديثة وبيانات وتكنولوجيا متقدمة
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
            {[
              { icon: Award, title: 'التميز', desc: 'نسعى دائماً لتقديم أعلى مستويات الجودة' },
              { icon: Users, title: 'الشراكة', desc: 'نبني علاقات طويلة الأمد مع عملائنا' },
              { icon: Target, title: 'النتائج', desc: 'نركز على تحقيق نتائج ملموسة وقابلة للقياس' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
