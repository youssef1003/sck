import { motion } from 'framer-motion'
import { Briefcase, Users, Building2, Target, Check } from 'lucide-react'

const Services = () => {
  const services = [
    {
      icon: Briefcase,
      title: 'الاستشارات الإدارية',
      description: 'نساعدك في بناء استراتيجية عمل قوية ومستدامة',
      features: [
        'تحليل السوق والمنافسين',
        'نمذجة الأعمال وتطوير المنتجات',
        'استراتيجيات النمو والتوسع',
        'تحسين العمليات التشغيلية',
        'إدارة المشاريع الاستراتيجية'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'استشارات الموارد البشرية',
      description: 'بناء فريق قوي ومتحفز لتحقيق أهداف شركتك',
      features: [
        'تصميم أنظمة التوظيف والاختيار',
        'تقييم الأداء وإدارة المواهب',
        'برامج التدريب والتطوير',
        'هيكلة الرواتب والحوافز',
        'تطوير ثقافة الشركة'
      ],
      color: 'from-secondary to-yellow-600'
    },
    {
      icon: Building2,
      title: 'التطوير التنظيمي',
      description: 'تحسين هيكل وعمليات شركتك لتحقيق أقصى كفاءة',
      features: [
        'تصميم الهيكل التنظيمي',
        'تحسين سير العمل والعمليات',
        'إدارة التغيير التنظيمي',
        'تطوير السياسات والإجراءات',
        'تحسين التواصل الداخلي'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Target,
      title: 'التخطيط الاستراتيجي',
      description: 'رسم خارطة طريق واضحة لمستقبل شركتك',
      features: [
        'وضع الرؤية والرسالة والأهداف',
        'تحليل SWOT الشامل',
        'بناء مؤشرات الأداء الرئيسية',
        'تحليل وإدارة المخاطر',
        'خطط التنفيذ والمتابعة'
      ],
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            خدماتنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto"
          >
            حلول استشارية شاملة مصممة خصيصاً لتلبية احتياجات عملك
          </motion.p>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Icon & Title */}
                <div className="flex-1">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <service.icon className="text-white" size={40} />
                  </div>
                  <h2 className="text-4xl font-bold text-primary mb-4">{service.title}</h2>
                  <p className="text-xl text-gray-600 mb-8">{service.description}</p>
                  <button className="px-8 py-3 bg-gradient-to-r from-secondary to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    احجز استشارة
                  </button>
                </div>

                {/* Features */}
                <div className="flex-1 bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold text-primary mb-6">ما نقدمه:</h3>
                  <ul className="space-y-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="text-secondary" size={16} />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
