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

export default function RealDevSquadSection() {
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

  return (
    <section id="real-dev-squad" className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Real Dev Squad</h2>
        </div>

        {/* What is it section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/3">
              <div className="w-full max-w-sm mx-auto aspect-square">
                <img 
                  src="/images/Real-Dev-Squad-logo.png" 
                  className="w-full h-full object-contain" 
                  alt="Real Dev Squad Logo"
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
            </div>
          </div>
        </div>

        {/* What does it teach section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What does it teach</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachings.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div 
                  key={index}
                  className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors duration-300 text-center"
                >
                  <IconComponent 
                    className="text-4xl mx-auto mb-4" 
                    style={{ color: item.color }}
                  />
                  <h3 className="text-lg font-medium">{item.title}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}