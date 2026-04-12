import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => onComplete(), 500)
          return 100
        }
        return prev + 2 // Faster progress
      })
    }, 30) // Shorter interval

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}
    >
      {/* Animated Particles Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="mb-12"
        >
          {/* Outer Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative w-64 h-64 mx-auto"
          >
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500 border-r-amber-500"></div>
          </motion.div>

          {/* Middle Rotating Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 w-64 h-64 mx-auto"
            style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="absolute inset-8 rounded-full border-2 border-amber-500/30 border-b-amber-500 border-l-blue-500"></div>
          </motion.div>

          {/* Center Logo Box */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(251, 191, 36, 0.3)",
                "0 0 60px rgba(59, 130, 246, 0.6), 0 0 120px rgba(251, 191, 36, 0.5)",
                "0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(251, 191, 36, 0.3)",
              ],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-3xl overflow-hidden backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(30, 64, 175, 0.9) 50%, rgba(217, 119, 6, 0.9) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated Shine Effect */}
            <motion.div
              animate={{
                x: [-200, 200],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
            />
            
            {/* SCQ Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-6xl font-bold text-white tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(59, 130, 246, 0.5)'
                  }}
                >
                  SCQ
                </motion.span>
              </motion.div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/50"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/50"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/50"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/50"></div>
          </motion.div>
        </motion.div>

        {/* Company Name with Stagger Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-8 mt-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            {['C', 'o', 'n', 's', 'u', 'l', 't', 'i', 'n', 'g'].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
                className="text-3xl font-light tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="text-sm text-blue-300/60 tracking-widest uppercase"
          >
            Excellence in Every Solution
          </motion.p>
        </motion.div>

        {/* Modern Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-96 mx-auto mt-12"
        >
          {/* Progress Container */}
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            {/* Animated Background */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
            
            {/* Progress Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full relative"
              style={{
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #f59e0b 100%)',
              }}
            >
              {/* Glowing Edge */}
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white/50 to-transparent"></div>
            </motion.div>
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center mt-4">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-blue-300/80 text-sm tracking-wider"
            >
              LOADING
            </motion.span>
            <motion.span
              className="text-amber-400 text-lg font-light tabular-nums"
            >
              {progress}%
            </motion.span>
          </div>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex justify-center gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Preloader
