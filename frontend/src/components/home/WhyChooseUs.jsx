import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Award, Users, TrendingUp } from 'lucide-react'

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Shield,
      title: 'Proven Expertise',
      description: '15+ years of delivering exceptional results across diverse industries in Saudi Arabia and Egypt.',
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Agile methodologies and rapid implementation strategies that deliver measurable outcomes quickly.',
    },
    {
      icon: Globe,
      title: 'Regional Focus',
      description: 'Deep understanding of Saudi and Egyptian markets with localized strategies that work.',
    },
    {
      icon: Award,
      title: 'Excellence Driven',
      description: 'Commitment to the highest standards of quality and continuous improvement in every project.',
    },
    {
      icon: Users,
      title: 'Client-Centric',
      description: 'Your success is our priority. We build long-term partnerships based on trust and results.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'Strategic solutions designed to scale your business and maximize sustainable growth.',
    },
  ]

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-6 py-2 rounded-full glass-gold mb-6"
            >
              <span className="text-amber-400 text-sm font-light tracking-wider">
                WHY CHOOSE US
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Success
              <br />
              <span className="text-gradient">Is Our Mission</span>
            </h2>

            <p className="text-xl text-white/70 mb-8 font-light leading-relaxed">
              We combine deep market expertise with innovative strategies to deliver 
              transformative results that exceed expectations.
            </p>

            <div className="space-y-6">
              {[
                { label: 'Market Understanding', value: 'Saudi Arabia & Egypt' },
                { label: 'Success Rate', value: '98% Client Satisfaction' },
                { label: 'Response Time', value: '24/7 Support Available' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl glass-gold"
                >
                  <span className="text-white/80 font-light">{item.label}</span>
                  <span className="text-amber-400 font-semibold">{item.value}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 px-10 py-5 rounded-2xl gradient-gold text-slate-900 font-semibold text-lg glow-gold-sm"
            >
              Start Your Journey
            </motion.button>
          </motion.div>

          {/* Right Side - Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 rounded-2xl glass-gold overflow-hidden"
              >
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-4"
                  >
                    <reason.icon className="w-6 h-6 text-slate-900" />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {reason.title}
                  </h3>

                  <p className="text-sm text-white/60 font-light leading-relaxed">
                    {reason.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-tl-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
