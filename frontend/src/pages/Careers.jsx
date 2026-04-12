import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, TrendingUp, Users, Award, Target } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Careers = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedJob, setSelectedJob] = useState(null)

  // Sample job listings - في الواقع هتيجي من API
  const jobs = [
    {
      id: 1,
      title: isRTL ? 'مستشار أعمال أول' : 'Senior Business Consultant',
      department: isRTL ? 'الاستشارات الإدارية' : 'Business Consulting',
      location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia',
      type: t('careers.full_time'),
      experience: '5-7',
      description: isRTL 
        ? 'نبحث عن مستشار أعمال متمرس للانضمام إلى فريقنا في الرياض. المرشح المثالي لديه خبرة واسعة في التخطيط الاستراتيجي وتطوير الأعمال.'
        : 'We are looking for an experienced business consultant to join our team in Riyadh. The ideal candidate has extensive experience in strategic planning and business development.',
      requirements: isRTL
        ? ['خبرة 5-7 سنوات في الاستشارات الإدارية', 'درجة البكالوريوس في إدارة الأعمال أو مجال ذي صلة', 'مهارات تواصل ممتازة بالعربية والإنجليزية', 'خبرة في السوق السعودي']
        : ['5-7 years experience in business consulting', 'Bachelor\'s degree in Business Administration or related field', 'Excellent communication skills in Arabic and English', 'Experience in Saudi market']
    },
    {
      id: 2,
      title: isRTL ? 'أخصائي موارد بشرية' : 'HR Specialist',
      department: isRTL ? 'الموارد البشرية' : 'Human Resources',
      location: isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt',
      type: t('careers.full_time'),
      experience: '3-5',
      description: isRTL
        ? 'نبحث عن أخصائي موارد بشرية للمساعدة في تطوير وتنفيذ استراتيجيات الموارد البشرية لعملائنا.'
        : 'We are looking for an HR specialist to help develop and implement HR strategies for our clients.',
      requirements: isRTL
        ? ['خبرة 3-5 سنوات في الموارد البشرية', 'معرفة بقوانين العمل المصرية', 'مهارات تحليلية قوية', 'شهادة مهنية في الموارد البشرية (مفضل)']
        : ['3-5 years experience in HR', 'Knowledge of Egyptian labor laws', 'Strong analytical skills', 'Professional HR certification (preferred)']
    },
    {
      id: 3,
      title: isRTL ? 'محلل دراسات جدوى' : 'Feasibility Study Analyst',
      department: isRTL ? 'دراسات الجدوى' : 'Feasibility Studies',
      location: isRTL ? 'عن بُعد' : 'Remote',
      type: t('careers.remote'),
      experience: '2-4',
      description: isRTL
        ? 'نبحث عن محلل دراسات جدوى لإعداد دراسات اقتصادية شاملة للمشاريع الاستثمارية.'
        : 'We are looking for a feasibility study analyst to prepare comprehensive economic studies for investment projects.',
      requirements: isRTL
        ? ['خبرة 2-4 سنوات في التحليل المالي', 'إجادة Excel والنمذجة المالية', 'درجة البكالوريوس في الاقتصاد أو المالية', 'مهارات كتابة تقارير ممتازة']
        : ['2-4 years experience in financial analysis', 'Proficiency in Excel and financial modeling', 'Bachelor\'s degree in Economics or Finance', 'Excellent report writing skills']
    }
  ]

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {t('careers.open_positions')}
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{job.description}</p>
                    
                    <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span>{job.department}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{job.location}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{job.type}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span>{job.experience} {t('careers.years')}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedJob(job)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 whitespace-nowrap"
                  >
                    {t('careers.apply_now')}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-slate-600">{t('careers.no_positions')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {t('careers.application.title')}
                </h3>
                <p className="text-slate-600">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('careers.application.name')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('careers.application.email')}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('careers.application.phone')}
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('careers.application.resume')}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('careers.application.cover_letter')}
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('careers.application.submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Careers
