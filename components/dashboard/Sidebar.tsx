import Link from 'next/link';
import { Home, Calendar, FileText, LogOut, User, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function Sidebar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch role to determine links
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'patient';

  const links = role === 'doctor' ? [
    { href: '/doctor', label: 'Dashboard', icon: Home },
    // Doctors usually manage schedule in dashboard, but could have separate page
  ] : [
    { href: '/patient', label: 'Dashboard', icon: Home },
    { href: '/patient/book', label: 'Book Appointment', icon: PlusCircle },
    { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          Health Connect
        </h2>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-500 mt-2 inline-block">
          {role.toUpperCase()} PORTAL
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition font-medium"
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {profile?.full_name?.[0] || 'U'}
           </div>
           <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
           </div>
        </div>
        <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium">
                <LogOut size={18} /> Sign Out
            </button>
        </form>
      </div>
    </div>
  );
}
