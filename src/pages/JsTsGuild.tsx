import Navigation from '../components/layout/Navigation'

export default function JsTsGuild() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <section id="js-ts-guild" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Guild Details</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/3">
              <div className="w-full max-w-sm mx-auto aspect-square">
                <img 
                  src="/images/JS-TS-Guild-logo.jpeg" 
                  className="w-full h-full object-cover rounded-lg" 
                  alt="JS TS Guild Logo"
                  loading="lazy"
                />
              </div>
            </div>
            
            <div className="lg:w-2/3">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}