import Link from 'next/link';
import { ShieldCheck, Video, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Health Connect</div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Log in
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Healthcare, <span className="text-blue-600">Reimagined.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10">
            Secure, encrypted video consultations with top specialists. 
            Manage your prescriptions and medical history in one compliant platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register?role=patient" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition">
              Find a Doctor
            </Link>
            <Link href="/register?role=doctor" className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-200 transition">
              I am a Doctor
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 border border-gray-100 rounded-xl hover:shadow-lg transition duration-300">
            <div className="mb-4"><Video className="w-8 h-8 text-blue-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">HD Video Consultations</h3>
            <p className="text-gray-500">Powered by LiveKit for crystal clear, low-latency video calls even on low bandwidth.</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-xl hover:shadow-lg transition duration-300">
            <div className="mb-4"><ShieldCheck className="w-8 h-8 text-blue-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">HIPAA Compliant</h3>
            <p className="text-gray-500">End-to-end encryption for video and AES-256 encryption for your medical records.</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-xl hover:shadow-lg transition duration-300">
            <div className="mb-4"><Calendar className="w-8 h-8 text-blue-600" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Scheduling</h3>
            <p className="text-gray-500">Real-time availability management and instant booking confirmation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
