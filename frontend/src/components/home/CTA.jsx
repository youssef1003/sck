import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Calendar } from 'lucide-react'
import { useState } from 'react'
import BookingModal from '../BookingModal'

const CTA = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            هل أنت مستعد للارتقاء بأعمالك؟
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            احجز استشارة مجانية اليوم ودعنا نساعدك في تحقيق أهدافك
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="group px-8 py-4 bg-gradient-to-r from-secondary to-yellow-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-secondary/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2 space-x-reverse"
            >
              <Calendar size={20} />
              <span>احجز استشارة مجانية</span>
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            </button>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-lg border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2 space-x-reverse"
            >
              <MessageCircle size={20} />
              <span>تحدث معنا عبر واتساب</span>
            </a>
          </div>

          {/* Trust Badge */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>استشارة مجانية 30 دقيقة</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>رد خلال 24 ساعة</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>بدون التزام</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  )
}

export default CTA
