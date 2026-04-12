import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, Briefcase, Award, TrendingUp } from 'lucide-react'

const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime
    let animationFrame

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = (currentTime - startTime) / (duration * 1000)

      if (progress < 1) {
        setCount(Math.floor(end * progress))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: 'Happy Clients',
      description: 'Across Saudi Arabia & Egypt',
      color: 'from-amber-400 to-yellow-500'
    },
    {
      icon: Briefcase,
      value: 1200,
      suffix: '+',
      label: 'Projects Completed',
      description: 'With 98% success rate',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: Award,
      value: 15,
      suffix: '+',
      label: 'Years Experience',
      description: 'Industry leadership',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: TrendingUp,
      value: 95,
      suffix: '%',
      label: 'Client Retention',
      description: 'Long-term partnerships',
      color: 'from-yellow-500 to-amber-400'
    },
  ]

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl"
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
              PROVEN TRACK RECORD
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Numbers That
            <span className="text-gradient"> Speak Volumes</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
            Our success is measured by the success of our clients
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl glass-gold overflow-hidden">
                {/* Hover Gradient Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6`}
                >
                  <stat.icon className="w-8 h-8 text-slate-900" />
                </motion.div>

                {/* Counter */}
                <div className="mb-4">
                  <div className="text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={stat.value} />
                    <span className="text-gradient">{stat.suffix}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-white/60 font-light">
                    {stat.description}
                  </p>
                </div>

                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-tl-full" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/0 to-yellow-500/0 group-hover:from-amber-500/20 group-hover:to-yellow-500/20 blur-xl transition-all duration-500 -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-20"
        >
          <p className="text-white/70 text-lg mb-6">
            Join hundreds of successful businesses
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl glass-gold border-2 border-amber-500/30 text-white font-semibold hover:border-amber-500/60 transition-all duration-300"
          >
            Become Our Next Success Story
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Stats
