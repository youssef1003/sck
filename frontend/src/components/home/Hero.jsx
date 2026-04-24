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
        {/* Professional Blue Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400"></div>
        
        {/* Geometric Shapes and Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large Circle - Top Right */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full"></div>
          
          {/* Medium Circle - Bottom Left */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/8 rounded-full"></div>
          
          {/* Geometric Lines - Top Left */}
          <div className="absolute top-20 left-20">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 rounded"></div>
              <div className="w-8 h-2 border-2 border-white/40 rounded"></div>
              <div className="w-8 h-2 border-2 border-white/40 rounded"></div>
            </div>
          </div>
          
          {/* Geometric Lines - Bottom Right */}
          <div className="absolute bottom-20 right-20">
            <div className="flex flex-col gap-2 items-end">
              <div className="w-8 h-8 bg-yellow-400 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 rounded"></div>
              <div className="w-8 h-2 border-2 border-white/40 rounded"></div>
              <div className="w-8 h-2 border-2 border-white/40 rounded"></div>
            </div>
          </div>
          
          {/* Arrow Patterns - Top Right */}
          <div className="absolute top-16 right-16">
            <div className="text-yellow-400 text-4xl font-bold">××</div>
          </div>
          
          {/* Arrow Patterns - Bottom Left */}
          <div className="absolute bottom-16 left-16">
            <div className="text-yellow-400 text-4xl font-bold">××</div>
          </div>
          
          {/* Chevron Arrows */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
            <div className="flex">
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20"></div>
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20 ml-1"></div>
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20 ml-1"></div>
            </div>
          </div>
          
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 rotate-180">
            <div className="flex">
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20"></div>
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20 ml-1"></div>
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[15px] border-r-white/20 ml-1"></div>
            </div>
          </div>
          
          {/* Wave Patterns */}
          <div className="absolute top-24 left-1/4">
            <svg width="40" height="20" viewBox="0 0 40 20" className="text-white/30">
              <path d="M0 10 Q10 0 20 10 T40 10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M0 15 Q10 5 20 15 T40 15" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          
          <div className="absolute bottom-24 right-1/4">
            <svg width="40" height="20" viewBox="0 0 40 20" className="text-white/30">
              <path d="M0 10 Q10 0 20 10 T40 10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M0 15 Q10 5 20 15 T40 15" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="synqor-container relative z-10 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Smaller Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              SYNQOR GROUP
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl mb-6 font-medium text-white/90"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Engineering Systems | Consulting for Excellence | Securing Quality
            </motion.p>
            
            {/* Original Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {t('hero.title')}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl mb-4 font-light text-white/80"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-lg mb-12 max-w-3xl mx-auto text-white/70"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
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
