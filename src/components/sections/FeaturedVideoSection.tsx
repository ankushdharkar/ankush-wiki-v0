import { BsYoutube } from 'react-icons/bs'
import RevealAnimation from '../ui/RevealAnimation'
import { trackExternalLink } from '../../services/analytics'
import { MEDIA_LINKS } from '../../config/links'

export default function FeaturedVideoSection() {
  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 md:px-6">
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <BsYoutube className="text-red-500" />
              Featured Podcast
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Watch my recent podcast appearance
            </p>
          </div>
        </RevealAnimation>

        <RevealAnimation delay={0.4}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${MEDIA_LINKS.youtubePodcastEmbedId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>

            <div className="text-center mt-6">
              <a
                href={MEDIA_LINKS.youtubePodcast}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                onClick={() => trackExternalLink(MEDIA_LINKS.youtubePodcast, 'Featured Video YouTube Link')}
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
