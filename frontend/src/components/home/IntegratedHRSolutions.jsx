import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Building, 
  Target, 
  DollarSign, 
  FileText, 
  BarChart, 
  Users, 
  Briefcase, 
  Settings,
  ArrowLeft
} from 'lucide-react'

const IntegratedHRSolutions = () => {
  const services = [
    {
      icon: Building,
      title: 'إعداد السياسات وهيكلة الشركات',
      description: 'نصمم الأنظمة والهياكل التنظيمية التي تضمن استقرار ونمو شركتك',
      slug: 'policies-structure',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'التخطيط الاستراتيجي للموارد البشرية',
      description: 'نحول التحديات الإدارية إلى فرص تنافسية من خلال التخطيط الاستراتيجي',
      slug: 'hr-strategic-planning',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: DollarSign,
      title: 'إعداد أنظمة الرواتب والمزايا',
      description: 'أنظمة رواتب ومزايا عادلة وتنافسية تضمن رضا الموظفين',
      slug: 'payroll-benefits',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: FileText,
      title: 'تصميم وتحديث بطاقات الوصف الوظيفي',
      description: 'أوصاف وظيفية دقيقة تحدد المسؤوليات والمتطلبات بوضوح',
      slug: 'job-description',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: BarChart,
      title: 'تصميم وتطبيق نظام مؤشرات الأداء',
      description: 'نظام مؤشرات أداء فعال يقيس الإنجاز ويحفز التميز',
      slug: 'kpi-system',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Users,
      title: 'التوظيف واستقطاب الخبرات',
      description: 'نستقطب الجدارة ونوفر لك الكفاءات المناسبة',
      slug: 'recruitment',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Briefcase,
      title: 'تأسيس الشركات وهندسة الأعمال',
      description: 'نساعدك في تأسيس شركتك بشكل احترافي ومتوافق مع الأنظمة',
      slug: 'business-setup',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: Settings,
      title: 'إدارة خدمات التعهيد',
      description: 'حلول تعهيد مرنة تخفض التكاليف وترفع الكفاءة',
      slug: 'outsourcing',
      color: 'from-indigo-500 to-blue-600'
    }
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />
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
            الحلول المتكاملة للموارد البشرية
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            نقدم حلولاً شاملة تغطي جميع جوانب إدارة الموارد البشرية وهندسة الأعمال
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="group block h-full"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
                >
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} mb-4 shadow-md`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>اعرف المزيد</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-full" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>عرض جميع الخدمات</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default IntegratedHRSolutions
