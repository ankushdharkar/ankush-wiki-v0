import RevealAnimation from '../ui/RevealAnimation'
import { trackExternalLink } from '../../services/analytics'
import { COMMUNITY_LINKS } from '../../config/links'

interface JsTsGuildSectionProps {
  isStandalone?: boolean;
}

export default function JsTsGuildSection({ isStandalone = false }: JsTsGuildSectionProps) {
  const containerClass = isStandalone
    ? "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-16 md:pt-20 pb-8 md:pb-20 transition-colors"
    : "py-16 md:py-24 bg-gray-100 dark:bg-gray-800 transition-colors";

  return (
    <section id="js-ts-guild" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">JS TS Guild</h2>
          </div>
        </RevealAnimation>

        {/* What is it section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <RevealAnimation delay={0.4} direction="left" className="lg:w-1/3">
              <div className="w-full max-w-sm mx-auto aspect-square">
                <img
                  src="/images/JS-TS-Guild-logo.jpeg"
                  className="w-full h-full object-cover rounded-lg"
                  alt="JS TS Guild Logo"
                  loading="lazy"
                />
              </div>
            </RevealAnimation>

            <RevealAnimation delay={0.6} direction="right" className="lg:w-2/3">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-6">What is it</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 text-xl">▶</span>
                      <div>
                        <strong>For:</strong><br />
                        Practicing writing practical code and focusing on engineering using the language. You will work often on the assignments provided.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 text-xl">▶</span>
                      <div>
                        <strong>Requirements:</strong><br />
                        Participating and engaging with others in server. Self accountability is encouraged.
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 text-xl">▶</span>
                      <div>
                        <strong>Location:</strong><br />
                        Discord (+ GitHub in future)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-500 dark:text-yellow-400 text-xl">▶</span>
                      <div>
                        <strong>Discord Link:</strong><br />
                        <a href={COMMUNITY_LINKS.jsTsGuildDiscord} target="_blank" rel="noopener noreferrer" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 focus-ring rounded-md" onClick={() => trackExternalLink(COMMUNITY_LINKS.jsTsGuildDiscord, 'JS TS Guild Discord')}>
                          Join Here
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <RevealAnimation delay={0.8}>
                  <a
                    href={COMMUNITY_LINKS.jsTsGuildDiscord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 focus-ring"
                    onClick={() => trackExternalLink(COMMUNITY_LINKS.jsTsGuildDiscord, 'JS TS Guild Join Button')}
                  >
                    Join the Guild
                  </a>
                </RevealAnimation>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  )
}
