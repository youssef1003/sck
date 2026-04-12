import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Rocket,
  ArrowRight 
} from 'lucide-react'
import { useState } from 'react'

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const services = [
    {
      icon: Lightbulb,
      title: 'Strategic Planning',
      description: 'Transform your vision into actionable strategies with data-driven insights and market intelligence.',
      features: ['Market Analysis', 'Growth Strategy', 'Risk Assessment'],
      color: 'from-amber-400 to-yellow-500',
      gradient: 'from-amber-500/20 to-yellow-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Business Growth',
      description: 'Accelerate your business expansion with proven methodologies and sustainable growth frameworks.',
      features: ['Revenue Optimization', 'Market Expansion', 'Performance Metrics'],
      color: 'from-yellow-400 to-amber-500',
      gradient: 'from-yellow-500/20 to-amber-500/20'
    },
    {
      icon: Users,
      title: 'Leadership Development',
      description: 'Build high-performing teams and develop leadership capabilities that drive organizational success.',
      features: ['Executive Coaching', 'Team Building', 'Culture Transformation'],
      color: 'from-amber-500 to-yellow-600',
      gradient: 'from-amber-500/20 to-yellow-600/20'
    },
    {
      icon: Target,
      title: 'Digital Transformation',
      description: 'Navigate the digital landscape with cutting-edge solutions and technology integration strategies.',
      features: ['Tech Integration', 'Process Automation', 'Digital Strategy'],
      color: 'from-yellow-500 to-amber-400',
      gradient: 'from-yellow-500/20 to-amber-400/20'
    },
    {
      icon: BarChart3,
      title: 'Financial Advisory',
      description: 'Optimize financial performance with expert guidance on investments, budgeting, and fiscal planning.',
      features: ['Financial Planning', 'Investment Strategy', 'Cost Optimization'],
      color: 'from-amber-400 to-yellow-500',
      gradient: 'from-amber-400/20 to-yellow-500/20'
    },
    {
      icon: Rocket,
      title: 'Innovation Consulting',
      description: 'Stay ahead of the curve with innovative solutions and disruptive business model development.',
      features: ['Innovation Strategy', 'Product Development', 'Market Disruption'],
      color: 'from-yellow-400 to-amber-600',
      gradient: 'from-yellow-400/20 to-amber-600/20'
    },
  ]

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 rounded-full glass-gold mb-6"
          >
            <span className="text-amber-400 text-sm font-light tracking-wider">
              OUR EXPERTISE
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Premium
            <span className="text-gradient"> Consulting Services</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto font-light">
            Comprehensive solutions tailored to elevate your business to new heights
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="group relative"
            >
              {/* Card */}
              <motion.div
                whileHover={{ y: -10 }}
                className="relative h-full p-8 rounded-3xl glass-gold overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      rotate: hoveredIndex === index ? 360 : 0,
                      scale: hoveredIndex === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} mb-6`}
                  >
                    <service.icon className="w-8 h-8 text-slate-900" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 mb-6 font-light leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center gap-2 text-sm text-white/60"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-amber-400 font-semibold group-hover:text-amber-300 transition-colors"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-500/10 to-transparent rounded-tr-full" />
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} blur-xl -z-10`}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 rounded-2xl gradient-gold text-slate-900 font-semibold text-lg glow-gold-sm"
          >
            View All Services
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Services
