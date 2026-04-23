import { motion } from 'framer-motion'
import { Award, Shield, Users, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Legacy = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const achievements = [
    {
      icon: Award,
      number: '55+',
      title: isRTL ? 'سنة من الخبرة' : 'Years of Excellence',
      description: isRTL ? 'في مجال الاستشارات الإدارية' : 'In Management Consulting'
    },
    {
      icon: Shield,
      number: '1000+',
      title: isRTL ? 'مشروع ناجح' : 'Successful Projects',
      description: isRTL ? 'عبر المملكة ومصر' : 'Across KSA and Egypt'
    },
    {
      icon: Users,
      number: '500+',
      title: isRTL ? 'عميل راضٍ' : 'Satisfied Clients',
      description: isRTL ? 'من الشركات الرائدة' : 'Leading Organizations'
    },
    {
      icon: TrendingUp,
      number: '95%',
      title: isRTL ? 'معدل النجاح' : 'Success Rate',
      description: isRTL ? 'في تحقيق الأهداف' : 'In Achieving Goals'
    }
  ]

  return (
    <section className="synqor-legacy synqor-section relative overflow-hidden">
      <div className="synqor-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--synqor-font-heading)' }}>
            {isRTL ? '55 عاماً من الريادة الإدارية' : '55 Years of Administrative Leadership'}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'var(--synqor-font-body)' }}>
            {isRTL 
              ? 'منذ تأسيسنا، نقود التميز في مجال الاستشارات الإدارية بخبرة عميقة وحلول مبتكرة'
              : 'Since our founding, we have led excellence in management consulting with deep expertise and innovative solutions'
            }
          </p>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <achievement.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                className="mb-4"
              >
                <div className="text-5xl md:text-6xl font-bold text-white mb-2" style={{ fontFamily: 'var(--synqor-font-heading)' }}>
                  {achievement.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2" style={{ fontFamily: 'var(--synqor-font-body)' }}>
                  {achievement.title}
                </h3>
                <p className="text-gray-400" style={{ fontFamily: 'var(--synqor-font-body)' }}>
                  {achievement.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 pt-16 border-t border-white/20"
        >
          <blockquote className="text-2xl md:text-3xl font-light text-gray-300 italic max-w-4xl mx-auto" style={{ fontFamily: 'var(--synqor-font-heading)' }}>
            {isRTL 
              ? '"التميز ليس مجرد هدف، بل أسلوب حياة نعيشه في كل مشروع نقوم به"'
              : '"Excellence is not just a goal, but a way of life we live in every project we undertake"'
            }
          </blockquote>
          <cite className="block mt-6 text-lg text-gray-400" style={{ fontFamily: 'var(--synqor-font-body)' }}>
            {isRTL ? '- فريق سينكور جروب' : '- Synqor Group Team'}
          </cite>
        </motion.div>
      </div>
    </section>
  )
}

export default Legacy