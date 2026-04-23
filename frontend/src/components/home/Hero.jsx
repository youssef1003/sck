import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BookingModal from '../BookingModal'

const Hero = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <section className="synqor-hero relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern - Already included in synqor-hero class */}
        
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"
        />

        {/* Main Content */}
        <div className="synqor-container relative z-10 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="synqor-heading text-6xl md:text-8xl font-bold mb-6"
            >
              SYNQOR GROUP
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="synqor-body text-xl md:text-2xl mb-4 font-medium"
            >
              Engineering Systems | Consulting for Excellence | Securing Quality
            </motion.p>
            
            {/* Original Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="synqor-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {t('hero.title')}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="synqor-body text-lg md:text-xl mb-4 font-light"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="synqor-body text-base md:text-lg mb-12 max-w-3xl mx-auto opacity-80"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => setIsBookingOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="synqor-btn-primary group text-lg flex items-center gap-3"
              >
                ابدأ رحلة التميز
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                href="tel:+966500000000"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
              >
                <Phone className="w-5 h-5" />
                {t('hero.learn_more')}
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-blue-400/50 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  )
}

export default Hero
