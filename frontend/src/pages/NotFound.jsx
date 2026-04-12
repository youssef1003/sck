import { Link } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const NotFound = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-9xl font-bold text-white mb-4"
        >
          404
        </motion.h1>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('common.page_not_found', 'الصفحة غير موجودة')}
        </h2>
        
        <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
          {t('common.page_not_found_desc', 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها')}
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-secondary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Home className="w-5 h-5" />
          {t('common.back_home', 'العودة للرئيسية')}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
