import { useEffect } from 'react'
import { motion } from 'motion/react'
import Navigation from '../components/layout/Navigation'
import { trackExternalLink } from '../services/analytics'
import { PRODUCT_LINKS } from '../config/links'

const curriculum = [
  { module: 'Foundations', topics: ['Arrays & Strings', 'Time & Space Complexity', 'Recursion Basics'], level: 'Beginner' },
  { module: 'Core Data Structures', topics: ['Linked Lists', 'Stacks & Queues', 'Hash Tables', 'Trees & Graphs'], level: 'Intermediate' },
  { module: 'Algorithms', topics: ['Sorting & Searching', 'Dynamic Programming', 'Greedy Algorithms', 'Backtracking'], level: 'Intermediate' },
  { module: 'Advanced Topics', topics: ['Graph Algorithms', 'Advanced DP', 'System Design Basics', 'Interview Patterns'], level: 'Advanced' },
]

const features = [
  {
    icon: '🎯',
    title: 'Interview-Ready Problems',
    description: 'Practice with real problems asked at top tech companies. Each problem is carefully selected to build your problem-solving intuition.'
  },
  {
    icon: '📊',
    title: 'Structured Curriculum',
    description: 'Follow a clear learning path from fundamentals to advanced topics. No more wondering what to study next.'
  },
  {
    icon: '💡',
    title: 'Detailed Explanations',
    description: 'Every solution comes with step-by-step explanations, complexity analysis, and multiple approaches.'
  },
  {
    icon: '🚀',
    title: 'Daily Challenges',
    description: 'Stay consistent with daily coding challenges that reinforce your learning and build muscle memory.'
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    description: 'Track your improvement over time with detailed analytics and personalized recommendations.'
  },
  {
    icon: '👥',
    title: 'Community Support',
    description: 'Join a community of motivated developers. Get help, share insights, and stay accountable.'
  },
]

const stats = [
  { value: '500+', label: 'Curated Problems' },
  { value: '50+', label: 'Video Explanations' },
  { value: '12', label: 'Core Modules' },
  { value: '24/7', label: 'Access' },
]

export default function RealDSA() {
  useEffect(() => {
    document.title = 'RealDSA - Master Data Structures & Algorithms'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-sm font-bold mb-8 border border-pink-200 dark:border-pink-600/50 shadow-lg shadow-pink-500/10"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              Premium DSA Learning Platform
            </motion.div>

            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <img src="/images/Real DSA.png" alt="RealDSA Logo" className="w-16 h-16 md:w-20 md:h-20" />
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                RealDSA
              </h1>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100"
            >
              Master Data Structures & Algorithms
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Structured learning, practical problems, and interview preparation to land your dream job at top tech companies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                href={PRODUCT_LINKS.realDsa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink(PRODUCT_LINKS.realDsa, 'RealDSA Hero CTA')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center gap-3">
                  Start Learning Now
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.a>

              <a
                href="#curriculum"
                className="px-8 py-4 border-2 border-pink-500 dark:border-pink-400 text-pink-700 dark:text-pink-300 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 dark:hover:text-white font-bold text-lg rounded-2xl transition-all duration-300"
              >
                View Curriculum
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              A complete platform designed to take you from beginner to interview-ready
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-24 bg-gradient-to-b from-pink-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Structured{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Curriculum
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              A clear path from fundamentals to mastery
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {curriculum.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold">{module.module}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    module.level === 'Beginner'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : module.level === 'Intermediate'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  }`}>
                    {module.level}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-12 md:p-16 shadow-2xl shadow-pink-500/30"
          >
            <img src="/images/Real DSA.png" alt="RealDSA Logo" className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Master DSA?
            </h2>
            <p className="text-pink-100 text-lg mb-10 max-w-xl mx-auto">
              Join hundreds of developers who've transformed their careers with structured DSA learning.
            </p>
            <motion.a
              href={PRODUCT_LINKS.realDsa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackExternalLink(PRODUCT_LINKS.realDsa, 'RealDSA Bottom CTA')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-pink-600 font-bold text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get Started Now
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} RealDSA. A product by Ankush Dharkar.
          </p>
        </div>
      </footer>
    </div>
  )
}
