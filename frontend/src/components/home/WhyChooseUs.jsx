import { motion } from 'framer-motion'
import { Shield, Award, TrendingUp, HeadphonesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const WhyChooseUs = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const reasons = [
    {
      icon: Shield,
      key: 'expertise',
    },
    {
      icon: Award,
      key: 'quality',
    },
    {
      icon: TrendingUp,
      key: 'proven',
    },
    {
      icon: HeadphonesIcon,
      key: 'support',
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {t('why_choose_us.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('why_choose_us.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative p-8 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden text-center"
            >
              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg mx-auto"
                >
                  <reason.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t(`why_choose_us.${reason.key}.title`)}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {t(`why_choose_us.${reason.key}.description`)}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-20 h-20 bg-gradient-to-${isRTL ? 'tr' : 'tl'} from-blue-500/5 to-transparent rounded-${isRTL ? 'tr' : 'tl'}-full`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
