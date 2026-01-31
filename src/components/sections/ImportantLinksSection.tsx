import RevealAnimation from '../ui/RevealAnimation'
import { motion } from 'motion/react'
import { BsYoutube } from 'react-icons/bs'
import { trackExternalLink } from '../../services/analytics'
import { MEDIA_LINKS } from '../../config/links'



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
        whileHover={{ scale: 1.01, y: -2 }}
        className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 p-5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
      >
        <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
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

export default function ImportantLinksSection({ isStandalone = false }: ImportantLinksSectionProps) {
  const links = [
    {
      type: 'youtube',
      title: 'Podcast Appearance',
      description: 'My featured podcast appearance on YouTube',
      url: MEDIA_LINKS.youtubePodcast,
      embedId: MEDIA_LINKS.youtubePodcastEmbedId,
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
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
    ? "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-20 pb-8 md:pb-20 transition-colors"
    : "py-20 bg-gray-50 dark:bg-gray-900 transition-colors";


  return (
    <section id="important-links" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Important Links</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Featured content, appearances, and key updates from across the web
            </p>
          </div>
        </RevealAnimation>

        {/* Featured Podcast */}
        <div className="mb-16">
          <RevealAnimation delay={0.4}>
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
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
              <h3 className="text-xl md:text-2xl font-semibold mb-4">Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-lg mx-auto">
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
            <p className="text-gray-600 dark:text-gray-300 mb-6">Check out more content and updates</p>
            <div className="flex justify-center gap-4">
              <a
                href={MEDIA_LINKS.youtubePodcast}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2 focus-ring"
                onClick={() => trackExternalLink(MEDIA_LINKS.youtubePodcast, 'YouTube Podcast')}
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
