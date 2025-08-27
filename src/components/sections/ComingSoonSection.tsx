import RevealAnimation from '../ui/RevealAnimation'
import { motion } from 'motion/react'

interface ComingSoonSectionProps {
  isStandalone?: boolean;
}

const ComingSoonCard = ({ 
  title, 
  description, 
  iconUrl, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  iconUrl: string;
  delay?: number;
}) => {
  return (
    <RevealAnimation delay={delay}>
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="flex h-fit w-full max-w-sm gap-3 rounded-md border border-gray-700 bg-gray-800 p-3 shadow-xl transition-shadow hover:shadow-lg"
      >
        <img
          src={iconUrl}
          alt={`${title} icon`}
          className="h-12 w-12 rounded-md object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-1/2 rounded-md bg-gray-600 animate-pulse" />
          <div className="h-2 w-3/4 rounded-md bg-gray-700 animate-pulse" />
          <div className="h-2 w-3/5 rounded-md bg-gray-700 animate-pulse" />
        </div>
        <div className="w-fit flex-shrink-0">
          <div className="w-8 h-8 rounded-sm bg-purple-600 p-2 flex items-center justify-center">
            <div className="block h-1.5 w-4 rounded-sm bg-gray-300 animate-pulse" />
          </div>
        </div>
      </motion.div>
      <div className="mt-2 px-3">
        <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
        <p className="text-gray-400 text-xs">{description}</p>
      </div>
    </RevealAnimation>
  )
}

export default function ComingSoonSection({ isStandalone = false }: ComingSoonSectionProps) {
  const comingSoonItems = [
    {
      title: 'Blog Posts',
      description: 'Technical articles and tutorials',
      iconUrl: '/images/blog-icon.png'
    },
    {
      title: 'Open Source Projects',
      description: 'Personal projects and contributions',
      iconUrl: '/images/github-icon.png'
    },
    {
      title: 'Speaking & Workshops',
      description: 'Conference talks and technical workshops',
      iconUrl: '/images/speaking-icon.png'
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
            <h2 className="text-4xl font-bold mb-4 text-white">Coming Soon</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Exciting new features and content are in development
            </p>
          </div>
        </RevealAnimation>

        {/* Coming Soon Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {comingSoonItems.map((item, index) => (
            <ComingSoonCard
              key={index}
              title={item.title}
              description={item.description}
              iconUrl={item.iconUrl}
              delay={0.4 + index * 0.2}
            />
          ))}
        </div>

        {/* Call to Action */}
        <RevealAnimation delay={1.2}>
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">Stay tuned for updates</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://twitter.com/ankushdharkar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
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