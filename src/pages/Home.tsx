import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Ankush Wiki</h1>
      <div className="space-y-4">
        <Link 
          to="/ace" 
          className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          View Aceternity Components Showcase
        </Link>
      </div>
    </div>
  )
}