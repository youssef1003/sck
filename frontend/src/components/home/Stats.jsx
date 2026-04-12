import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, Briefcase, Award, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: t('stats.clients'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Briefcase,
      value: 1200,
      suffix: '+',
      label: t('stats.projects'),
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Award,
      value: 15,
      suffix: '+',
      label: t('stats.experience'),
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: TrendingUp,
      value: 98,
      suffix: '%',
      label: t('stats.satisfaction'),
      color: 'from-sky-500 to-blue-500'
    },
  ]

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group text-center"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg mx-auto`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Counter */}
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stat.value} />
                <span className="text-blue-400">{stat.suffix}</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-200">
                {stat.label}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
