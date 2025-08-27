import RevealAnimation from '../ui/RevealAnimation'
import { motion } from 'motion/react'
import { BsYoutube } from 'react-icons/bs'



interface ImportantLinksSectionProps {
  isStandalone?: boolean;
}

type LinkType = {
  type: string;
  title: string;
  description: string;
  url: string;
  embedId?: string;
  icon: any;
  color: string;
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
        whileHover={{ scale: 1.02, y: -2 }}
        className="flex h-fit w-full gap-3 rounded-md border border-gray-700 bg-gray-800 p-3 shadow-xl transition-shadow hover:shadow-lg"
      >
        <div className="h-12 w-12 rounded-md bg-gray-700 animate-pulse flex-shrink-0" />
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

export default function ImportantLinksSection({ isStandalone = false }: ImportantLinksSectionProps) {
  const links = [
    {
      type: 'youtube',
      title: 'Podcast Appearance',
      description: 'My featured podcast appearance on YouTube',
      url: 'https://www.youtube.com/watch?v=idLp9jI44L0',
      embedId: 'idLp9jI44L0',
      icon: BsYoutube,
      color: '#FF0000'
    }
  ]

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

  const renderEmbed = (link: LinkType) => {
    switch (link.type) {
      case 'youtube':
        return (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${link.embedId || ''}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }


  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-900 text-white pt-20 pb-8 md:pb-20" 
    : "py-20 bg-gray-900";


  return (
    <section id="important-links" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Important Links</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Featured content, appearances, and key updates from across the web
            </p>
          </div>
        </RevealAnimation>

        {/* Featured Podcast */}
        <div className="mb-16">
          <RevealAnimation delay={0.4}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <BsYoutube className="text-red-500" />
                Podcast Appearance
              </h3>
            </div>
            <div className="max-w-4xl mx-auto">
              {renderEmbed(links[0])}
            </div>
          </RevealAnimation>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-16">
          <RevealAnimation delay={0.6}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                Exciting new features and content are in development
              </p>
            </div>
          </RevealAnimation>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {comingSoonItems.map((item, index) => (
              <ComingSoonCard
                key={index}
                title={item.title}
                description={item.description}
                delay={0.8 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <RevealAnimation delay={1.2}>
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">Check out more content and updates</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://www.youtube.com/watch?v=idLp9jI44L0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
              >
                <BsYoutube />
                Watch on YouTube
              </a>
            </div>
          </div>
        </RevealAnimation>
      </div>
    </section>
  )
}