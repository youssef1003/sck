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
        
        {/* Professional Geometric Shapes - Clean Corporate Design */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main Grid Pattern Background */}
          <div className="absolute inset-0 opacity-10 grid-pattern">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Top Left - Professional Card Stack with Logo */}
          <div className="absolute top-16 left-16 mobile-keep">
            <div className="space-y-3">
              <div className="w-24 h-16 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
                {/* Mini SCQ Logo */}
                <svg width="20" height="20" viewBox="0 0 100 100" className="text-cyan-300">
                  <path d="M15 25 Q15 15 25 15 L35 15 Q45 15 45 25 Q45 35 35 35 L25 35 Q15 35 15 45 Q15 55 25 55 L35 55 Q45 55 45 65" 
                        stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
                  <path d="M75 25 Q65 15 55 25 L55 45 Q55 55 65 55 Q75 55 75 45" 
                        stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
                  <circle cx="85" cy="40" r="12" stroke="currentColor" strokeWidth="6" fill="none"/>
                  <path d="M80 40 L83 43 L90 36" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="w-20 h-12 bg-white/8 backdrop-blur-sm rounded-lg border border-white/15"></div>
              <div className="w-16 h-8 bg-white/6 backdrop-blur-sm rounded-lg border border-white/10"></div>
            </div>
          </div>

          {/* Top Right - Service Icons Grid */}
          <div className="absolute top-20 right-20">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-cyan-300 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-cyan-300 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                <div className="w-6 h-2 bg-cyan-300 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
                <div className="w-2 h-6 bg-cyan-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Bottom Left - Progress Bars */}
          <div className="absolute bottom-24 left-20">
            <div className="space-y-3">
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
              </div>
              <div className="w-28 h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="w-5/6 h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
              </div>
              <div className="w-24 h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Corporate Stats Cards */}
          <div className="absolute bottom-16 right-16">
            <div className="flex gap-3">
              <div className="stats-pulse w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex flex-col items-center justify-center">
                <div className="text-cyan-300 font-bold text-lg">55</div>
                <div className="w-8 h-1 bg-cyan-300 rounded-full mt-1"></div>
              </div>
              <div className="stats-pulse w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex flex-col items-center justify-center">
                <div className="text-blue-300 font-bold text-lg">100</div>
                <div className="w-8 h-1 bg-blue-300 rounded-full mt-1"></div>
              </div>
            </div>
          </div>

          {/* Center Left - Floating Elements */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
            <div className="space-y-6">
              <div className="floating-element w-8 h-8 bg-cyan-400/20 backdrop-blur-sm rounded-lg border border-cyan-300/30 rotate-45"></div>
              <div className="floating-element w-6 h-6 bg-blue-400/20 backdrop-blur-sm rounded-full border border-blue-300/30"></div>
              <div className="floating-element w-10 h-2 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Center Right - Floating Elements */}
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
            <div className="space-y-6">
              <div className="floating-element w-8 h-8 bg-blue-400/20 backdrop-blur-sm rounded-lg border border-blue-300/30 rotate-12"></div>
              <div className="floating-element w-6 h-6 bg-cyan-400/20 backdrop-blur-sm rounded-full border border-cyan-300/30"></div>
              <div className="floating-element w-10 h-2 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Subtle Connecting Lines */}
          <div className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-3/4 right-1/4 w-40 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-1/2 left-1/3 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

          {/* Large Background Shapes */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl"></div>
          
          {/* Professional Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32">
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
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
