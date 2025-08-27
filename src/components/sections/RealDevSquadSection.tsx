import { 
  RiRouterLine,
  RiDatabase2Line, 
  RiCamera3Line,
  RiEnglishInput,
  RiCodeSSlashFill,
  RiBarChartBoxLine,
  RiFileList3Line,
  RiImageLine,
  RiBaseStationLine,
  RiCloudLine,
  RiTerminalLine
} from 'react-icons/ri'
import RevealAnimation from '../ui/RevealAnimation'
import { motion } from 'motion/react'

interface RealDevSquadSectionProps {
  isStandalone?: boolean;
}

export default function RealDevSquadSection({ isStandalone = false }: RealDevSquadSectionProps) {
  const teachings = [
    { icon: RiRouterLine, title: "Software Engineering", color: "#ffbb2c" },
    { icon: RiDatabase2Line, title: "Communication", color: "#5578ff" },
    { icon: RiCamera3Line, title: "Presentation", color: "#e80368" },
    { icon: RiEnglishInput, title: "Work Ethics", color: "#1c7d32" },
    { icon: RiCodeSSlashFill, title: "Planning", color: "#28a745" },
    { icon: RiBarChartBoxLine, title: "Ownership", color: "#f1081f" },
    { icon: RiFileList3Line, title: "Algorithms", color: "#47aeff" },
    { icon: RiImageLine, title: "Team Collaboration", color: "#ffc107" },
    { icon: RiBaseStationLine, title: "Winning", color: "#5578ff" },
    { icon: RiCloudLine, title: "Project-based learning", color: "#ffc107" },
    { icon: RiTerminalLine, title: "Life Skills", color: "#ffc107" }
  ]

  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-900 text-white pt-20 pb-8 md:pb-20" 
    : "py-20 bg-gray-800";

  return (
    <section id="real-dev-squad" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real Dev Squad</h2>
          </div>
        </RevealAnimation>

        {/* What is it section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <RevealAnimation delay={0.4} direction="left" className="lg:w-1/3">
              <div className="w-full max-w-sm mx-auto aspect-square">
                <img 
                  src="/images/Real-Dev-Squad-logo.png" 
                  className="w-full h-full object-contain" 
                  alt="Real Dev Squad Logo"
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
                        Developers, Designs, Product Managers, Project Managers, Social media marketing
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl">▶</span>
                      <div>
                        <strong>Requirements:</strong><br />
                        Time commitment necessary
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
                        Discord + GitHub
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl">▶</span>
                      <div>
                        <strong>Contact:</strong><br />
                        @ankushdharkar on Twitter
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </RevealAnimation>
          </div>
        </div>

        {/* What does it teach section */}
        <div>
          <RevealAnimation delay={0.8}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What does it teach</h2>
            </div>
          </RevealAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachings.map((item, index) => {
              const IconComponent = item.icon
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6,
                    delay: 1 + index * 0.1,
                    ease: [0.25, 0.8, 0.25, 1]
                  }}
                  className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 text-center"
                >
                  <IconComponent 
                    className="text-4xl mx-auto mb-4" 
                    style={{ color: item.color }}
                  />
                  <h3 className="text-lg font-medium">{item.title}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}