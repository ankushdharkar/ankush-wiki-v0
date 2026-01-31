import RevealAnimation from '../ui/RevealAnimation'
import { motion } from 'motion/react'
import { SOCIAL_LINKS } from '../../config/links'

interface ComingSoonSectionProps {
  isStandalone?: boolean;
}

const ComingSoonCard = ({
  title,
  description,
  delay = 0
}: {
  title: string;
  description: string;
  delay?: number;
}) => {
  return (
    <RevealAnimation delay={delay}>
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/50 p-5 transition-all hover:border-gray-500"
      >
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        <div className="border-t border-gray-700 pt-3">
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Coming Soon
          </span>
        </div>
      </motion.div>
    </RevealAnimation>
  )
}

export default function ComingSoonSection({ isStandalone = false }: ComingSoonSectionProps) {
  const comingSoonItems = [
    {
      title: 'Blog Posts',
      description: 'Technical articles and tutorials'
    },
    {
      title: 'Open Source Projects',
      description: 'Personal projects and contributions'
    },
    {
      title: 'Speaking & Workshops',
      description: 'Conference talks and technical workshops'
    }
  ]

  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-900 text-white pt-20 pb-8 md:pb-20" 
    : "py-20 bg-gray-900";

  return (
    <section id="coming-soon" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">Coming Soon</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Exciting new features and content are in development
            </p>
          </div>
        </RevealAnimation>

        {/* Coming Soon Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {comingSoonItems.map((item, index) => (
            <ComingSoonCard
              key={index}
              title={item.title}
              description={item.description}
              delay={0.4 + index * 0.2}
            />
          ))}
        </div>

        {/* Call to Action */}
        <RevealAnimation delay={1.2}>
          <div className="text-center mt-16">
            <p className="text-gray-300 mb-6">Stay tuned for updates</p>
            <div className="flex justify-center gap-4">
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 focus-ring"
              >
                Follow for Updates
              </a>
            </div>
          </div>
        </RevealAnimation>
      </div>
    </section>
  )
}