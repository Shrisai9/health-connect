import Link from 'next/link';
import {
  ShieldCheck,
  Video,
  Calendar,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Star,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lock,
  ArrowRight,
  Activity,
  PhoneCall
} from 'lucide-react';

export default function LandingPage() {
  const specialties = [
    { name: 'General Physician', icon: Stethoscope, tag: 'Cough, Fever, Routine Care', doctors: '18 Doctors' },
    { name: 'Cardiology', icon: HeartPulse, tag: 'Heart & Blood Pressure', doctors: '8 Doctors' },
    { name: 'Dermatology', icon: Sparkles, tag: 'Skin, Hair & Allergies', doctors: '10 Doctors' },
    { name: 'Pediatrics', icon: Baby, tag: 'Child & Infant Wellness', doctors: '7 Doctors' },
    { name: 'Orthopedics', icon: Bone, tag: 'Joints, Bones & Spine', doctors: '6 Doctors' },
    { name: 'Psychiatry', icon: Brain, tag: 'Mental Health & Therapy', doctors: '5 Doctors' },
  ];

  const featuredDoctors = [
    {
      name: 'Dr. Priya Sharma',
      degrees: 'MBBS, MD (Medicine)',
      specialization: 'General Physician',
      experience: '12+ yrs experience',
      rating: 4.9,
      reviews: 840,
      fee: 499,
      availability: 'Available Today',
      hospital: 'Ex-AIIMS New Delhi',
      avatarColor: 'from-teal-500 to-emerald-600',
    },
    {
      name: 'Dr. Rajesh Verma',
      degrees: 'MBBS, DM (Cardiology)',
      specialization: 'Senior Cardiologist',
      experience: '15+ yrs experience',
      rating: 5.0,
      reviews: 1120,
      fee: 899,
      availability: 'Next: 10:30 AM',
      hospital: 'Fortis Escorts Heart Inst.',
      avatarColor: 'from-sky-500 to-blue-600',
    },
    {
      name: 'Dr. Ananya Iyer',
      degrees: 'MBBS, MD (Dermatology)',
      specialization: 'Consultant Dermatologist',
      experience: '9+ yrs experience',
      rating: 4.8,
      reviews: 620,
      fee: 699,
      availability: 'Available Today',
      hospital: 'Apollo Hospitals',
      avatarColor: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'Dr. Rohan Kulkarni',
      degrees: 'MBBS, DCH (Pediatrics)',
      specialization: 'Specialist Pediatrician',
      experience: '11+ yrs experience',
      rating: 4.9,
      reviews: 750,
      fee: 549,
      availability: 'Next: 02:00 PM',
      hospital: 'Manipal Children’s Clinic',
      avatarColor: 'from-emerald-500 to-teal-700',
    },
  ];

  const trustMetrics = [
    { value: '10,000+', label: 'Consultations Completed', sub: 'Across 28 Indian States' },
    { value: '50+', label: 'Verified Specialists', sub: 'MCI/NMC Registered' },
    { value: '4.9 / 5', label: 'Average Patient Rating', sub: 'From 3,400+ Verified Reviews' },
    { value: '100%', label: 'HIPAA & NABH Compliant', sub: 'End-to-End Encrypted' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Glassmorphic Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
                HealthConnect
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Telehealth India
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#specialties" className="hover:text-teal-600 transition">Specialties</a>
            <a href="#doctors" className="hover:text-teal-600 transition">Top Doctors</a>
            <a href="#metrics" className="hover:text-teal-600 transition">Why HealthConnect</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition">How it Works</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Log in
            </Link>
            <Link
              href="/register?role=patient"
              className="text-sm font-semibold bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-teal-600/20 transition hover:shadow-md"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-sky-100/70 via-teal-100/50 to-emerald-100/40 blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50/90 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6 shadow-xs backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>National Telemedicine Guidelines 2020 & NABH Compliant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Expert Teleconsultations,{' '}
              <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Reimagined for India.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-9 leading-relaxed max-w-2xl mx-auto">
              Connect with India’s leading verified specialists over secure, encrypted HD video. 
              Enjoy 30-day validated schedule booking, instant slot confirmation, and digital printable prescriptions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
              <Link
                href="/register?role=patient"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-teal-600/25 transition hover:shadow-xl hover:-translate-y-0.5"
              >
                Find a Doctor & Book Slot
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register?role=doctor"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl text-base font-semibold shadow-xs transition hover:-translate-y-0.5"
              >
                Join as a Doctor
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Consultations from ₹499
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600" /> AES-256 Encrypted Health Data
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-sky-600" /> Digital Signed Rx Slip
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Quick-Filter Strip */}
      <section id="specialties" className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Quick Access Specialties</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Consult by Medical Department
              </h2>
            </div>
            <Link
              href="/register?role=patient"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
            >
              Explore all 24+ specialties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {specialties.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={`/register?role=patient`}
                  className="group p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-gradient-to-b hover:from-white hover:to-teal-50/40 hover:border-teal-400 hover:shadow-md transition duration-200 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 group-hover:bg-gradient-to-tr group-hover:from-sky-600 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 transition shadow-xs mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {item.tag}
                  </p>
                  <span className="mt-2 text-[10px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                    {item.doctors}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctor Showcase Cards */}
      <section id="doctors" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Verified Medical Specialists</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Doctors Available for Video Consult</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              All doctors are verified with the National Medical Commission (NMC) and hold active clinical licenses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc.name}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-300 transition duration-300 flex flex-col overflow-hidden group"
              >
                {/* Top Badge & Avatar */}
                <div className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${doc.avatarColor} text-white font-bold text-lg flex items-center justify-center shadow-md shadow-teal-700/15 group-hover:scale-105 transition`}>
                      {doc.name.split(' ').map((n, i) => i === 1 ? n[0] : (i === 2 ? n[0] : '')).join('') || 'DR'}
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{doc.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-amber-600/80 font-normal">({doc.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">{doc.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{doc.degrees}</p>
                  <p className="text-xs font-semibold text-teal-700 mt-1">{doc.specialization}</p>
                </div>

                {/* Details */}
                <div className="p-5 pt-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Experience</span>
                      <span className="font-semibold text-slate-700">{doc.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Background</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{doc.hospital}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Next Slot</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {doc.availability}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-xs text-slate-400">Consultation Fee</span>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900">₹{doc.fee.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400 font-normal"> / consult</span>
                      </div>
                    </div>

                    <Link
                      href="/register?role=patient"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-teal-600 text-white text-xs font-semibold transition duration-150 shadow-xs"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Live Metrics Strip */}
      <section id="metrics" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
            {trustMetrics.map((stat, i) => (
              <div key={stat.label} className={i > 0 ? 'pt-6 md:pt-0' : ''}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-200">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Streamlined Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How HealthConnect Works in 3 Steps</h2>
            <p className="text-sm text-slate-500 mt-2">No crowded waiting rooms. No commute. Just compassionate care from home.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pick Doctor & Time Slot</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browse verified specialists by department and select a validated clinic schedule slot with our interactive date slider.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Join Encrypted HD Video Call</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your private LiveKit video room with 1-click. Share symptoms, ask questions, and consult comfortably.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-base mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Digital Printable Rx Slip</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive an official, digitally signed prescription slip with dosage instructions, ready to print or order medicines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">HealthConnect</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-white transition">Patient Login</Link>
              <Link href="/login" className="hover:text-white transition">Doctor Login</Link>
              <Link href="/register?role=patient" className="hover:text-white transition">Register</Link>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-semibold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
              <span>National Emergency: 112 / 108</span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© 2026 HealthConnect India. All rights reserved.</p>
            <p className="text-center sm:text-right max-w-xl text-[11px]">
              Disclaimer: HealthConnect provides teleconsultations as per the Telemedicine Practice Guidelines issued by Ministry of Health and Family Welfare, Govt. of India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
