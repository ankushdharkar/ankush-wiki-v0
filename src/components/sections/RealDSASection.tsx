import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import RevealAnimation from '../ui/RevealAnimation'
import { trackExternalLink } from '../../services/analytics'

interface RealDSASectionProps {
  isStandalone?: boolean;
}

const benefits = [
  {
    icon: '🎯',
    title: 'Interview-Ready',
    description: 'Real FAANG-level problems with structured practice paths'
  },
  {
    icon: '📚',
    title: 'Structured Learning',
    description: 'No overwhelm - clear progression from basics to advanced'
  },
  {
    icon: '💻',
    title: 'Hands-On Practice',
    description: 'Code, test, and master with real coding challenges'
  },
  {
    icon: '🚀',
    title: 'Premium Support',
    description: 'Direct help when you\'re stuck on tough problems'
  }
]

export default function RealDSASection({ isStandalone = false }: RealDSASectionProps) {
  const containerClass = isStandalone
    ? "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-20 pb-8 md:pb-20 transition-colors"
    : "py-20 bg-gradient-to-b from-orange-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-colors";

  return (
    <section id="real-dsa" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold mb-6 border border-orange-200 dark:border-orange-700/50"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Premium Learning Platform
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                RealDSA
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Master Data Structures & Algorithms with structured, practical, and premium learning
            </p>
          </div>
        </RevealAnimation>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white dark:bg-gray-800/60 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <RevealAnimation delay={0.8}>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="https://realdsa.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink('https://realdsa.com', 'RealDSA CTA')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 flex items-center gap-2"
              >
                Start Learning Today
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.a>

              <Link
                to="/real-dsa"
                className="px-6 py-3.5 border-2 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white font-semibold rounded-xl transition-all duration-300"
              >
                Learn More
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Join hundreds of developers mastering DSA for their dream jobs
            </p>
          </div>
        </RevealAnimation>
      </div>
    </section>
  )
}
