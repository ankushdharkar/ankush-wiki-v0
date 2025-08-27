import RevealAnimation from '../ui/RevealAnimation'

interface JsTsGuildSectionProps {
  isStandalone?: boolean;
}

export default function JsTsGuildSection({ isStandalone = false }: JsTsGuildSectionProps) {
  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-900 text-white pt-20 pb-8 md:pb-20" 
    : "py-20 bg-gray-800";
  
  return (
    <section id="js-ts-guild" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">JS TS Guild</h2>
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
              <p className="text-xl mb-8">What is it</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl">▶</span>
                      <div>
                        <strong>For:</strong><br />
                        Practicing writing practical code and focusing on engineering using the language. You will work often on the assignments provided.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl">▶</span>
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
                      <span className="text-green-400 text-xl">▶</span>
                      <div>
                        <strong>Location:</strong><br />
                        Discord (+ GitHub in future)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl">▶</span>
                      <div>
                        <strong>Discord Link:</strong><br />
                        <a href="https://discord.gg/Vm2dugCsC8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          Join Here
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  )
}