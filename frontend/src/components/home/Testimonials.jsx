import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useState } from 'react'
const Testimonials = () => {
  const testimonials = [
    {
      name: 'أحمد محمد',
      position: 'المدير التنفيذي',
      company: 'شركة النجاح للتجارة',
      country: '🇪🇬 مصر',
      image: 'https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=0A1F44&color=fff',
      rating: 5,
      text: 'ساعدتنا SCQ في إعادة هيكلة شركتنا بالكامل. النتائج كانت مذهلة وتجاوزت توقعاتنا بكثير.'
    },
    {
      name: 'فاطمة العلي',
      position: 'مديرة الموارد البشرية',
      company: 'مجموعة الرياض',
      country: '🇸🇦 السعودية',
      image: 'https://ui-avatars.com/api/?name=Fatima+Alali&background=C9A14A&color=fff',
      rating: 5,
      text: 'الاستشارات التي قدموها لنا في مجال الموارد البشرية كانت احترافية للغاية. فريق متميز وخدمة ممتازة.'
    },
    {
      name: 'محمد السعيد',
      position: 'مؤسس ومدير',
      company: 'تك ستارت',
      country: '🇪🇬 مصر',
      image: 'https://ui-avatars.com/api/?name=Mohamed+Alsaeed&background=0A1F44&color=fff',
      rating: 5,
      text: 'كشركة ناشئة، كنا بحاجة لتوجيه استراتيجي. SCQ قدمت لنا خارطة طريق واضحة ساعدتنا على النمو بسرعة.'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            آراء العملاء
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            ماذا يقول عملاؤنا؟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نفخر بثقة عملائنا ونسعى دائماً لتجاوز توقعاتهم
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-secondary/50 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 opacity-10">
                <Quote size={60} className="text-secondary" />
              </div>

              {/* Rating */}
              <div className="flex space-x-1 space-x-reverse mb-4 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center space-x-4 space-x-reverse relative z-10">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full border-2 border-secondary/20"
                />
                <div>
                  <h4 className="font-bold text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-xs text-secondary font-medium">
                    {testimonial.company} {testimonial.country}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
