import Link from 'next/link';
import { LogOut, Activity, Stethoscope } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SidebarNav from './SidebarNav';

export default async function Sidebar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch role to determine links and labels
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'patient';

  return (
    <div className="flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen max-md:fixed max-md:top-auto max-md:bottom-0 max-md:w-full max-md:h-auto max-md:min-h-0 max-md:flex-row max-md:border-r-0 max-md:border-t max-md:z-50 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 max-md:hidden">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Health<span className="text-teal-600">Connect</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Clinical Telemedicine</p>
          </div>
        </Link>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            {role} Portal
          </span>
        </div>
      </div>

      {/* Navigation Links with Active State Highlighting */}
      <SidebarNav role={role} />

      {/* Mobile Sign Out */}
      <div className="hidden max-md:flex max-md:items-center max-md:px-2">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex flex-col items-center gap-1 px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-medium"
            title="Sign Out"
          >
            <LogOut size={18} />
            <span>Exit</span>
          </button>
        </form>
      </div>

      {/* Desktop User Profile Footer */}
      <div className="p-4 border-t border-slate-100 max-md:hidden bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white border border-slate-200/60 shadow-xs">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile?.full_name || 'Admin User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-semibold border border-transparent hover:border-rose-100"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
