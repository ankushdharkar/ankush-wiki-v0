import RevealAnimation from '../ui/RevealAnimation'

interface ChilloutsSectionProps {
  isStandalone?: boolean;
}

export default function ChilloutsSection({ isStandalone = false }: ChilloutsSectionProps) {
  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-900 text-white pt-20 pb-8 md:pb-20" 
    : "py-20 bg-gray-900";
  
  return (
    <section id="chillouts" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Chillouts</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A community focused on friends, relationships, high quality connections, dating, life, partnerships, and fun.
            </p>
          </div>
        </RevealAnimation>

        {/* What is it section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <RevealAnimation delay={0.4} direction="left" className="lg:w-1/3">
              <div className="w-full max-w-sm mx-auto text-center">
                <div className="text-8xl mb-6">💝</div>
                <h3 className="text-2xl font-bold text-pink-400">Community & Connection</h3>
              </div>
            </RevealAnimation>
            
            <RevealAnimation delay={0.6} direction="right" className="lg:w-2/3">
              <p className="text-xl mb-8">What we focus on</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-pink-400 text-xl">💫</span>
                      <div>
                        <strong>Friends & Relationships:</strong><br />
                        Building meaningful connections and lasting friendships
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-pink-400 text-xl">💫</span>
                      <div>
                        <strong>High Quality Connections:</strong><br />
                        Fostering deep, authentic relationships
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-pink-400 text-xl">💫</span>
                      <div>
                        <strong>Life & Partnerships:</strong><br />
                        Supporting each other through life's journey
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-pink-400 text-xl">💫</span>
                      <div>
                        <strong>Fun Together:</strong><br />
                        Creating joy and memorable experiences
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <RevealAnimation delay={0.8}>
                  <a 
                    href="https://docs.google.com/document/d/1Pn37IDyVp3yQV9PZduFwWMZa8yHP7FCitvRwo7Zdv5Y/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                  >
                    Join Our Community
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