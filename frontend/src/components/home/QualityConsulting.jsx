import { motion } from 'framer-motion'
import { Award, Users, TrendingUp, Shield } from 'lucide-react'

const QualityConsulting = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">أنظمة الجودة والاستشارات</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              خبرة تمتد لأكثر من 25 عاماً
            </h2>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20"
          >
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 text-center">
              تجمع <span className="font-bold text-yellow-400">SCQ GROUP</span> بين إرثٍ استشاري يمتد لأكثر من 25 عاماً من الخبرة التراكمية لمؤسسها وفريق من الخبراء المتخصصين في هندسة الأعمال وإدارة الموارد البشرية. نحن لا نقدم حلولاً تقليدية، بل نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك عبر ممارسات إدارية وقانونية منضبطة.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-yellow-400/20 mb-4">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">فريق متخصص</h3>
                <p className="text-white/80">خبراء في هندسة الأعمال وإدارة الموارد البشرية</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-yellow-400/20 mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">نمو مستدام</h3>
                <p className="text-white/80">أنظمة تضمن استقرار ونمو شركتك</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-yellow-400/20 mb-4">
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ممارسات منضبطة</h3>
                <p className="text-white/80">إدارة قانونية وإدارية احترافية</p>
              </motion.div>
            </div>

            {/* Bottom Text */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center text-white/90 mt-8 text-lg"
            >
              قوتنا تكمن في قدرتنا على <span className="font-bold text-yellow-400">تحويل التحديات الإدارية إلى فرص تنافسية</span> من خلال استقطاب الجدارة وبناء قواعد العمل المؤسسي.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default QualityConsulting
