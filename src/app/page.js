import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen text-black bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl"></span>
              <span className="ml-2 text-xl font-bold">AI Student Counsellor</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                Sign In
              </Link>
              <Link href="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Your Personal AI Counsellor</h1>
          <p className="text-xl text-gray-600 mb-8">Personalized academic and career guidance powered by AI</p>
          <Link href="/register" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700">
            Start Free
          </Link>
        </div>
      </div>
    </div>
  );
}
