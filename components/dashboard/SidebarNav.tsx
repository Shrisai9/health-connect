'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, PlusCircle, FileText, Stethoscope } from 'lucide-react';

interface SidebarNavProps {
  role: string;
}

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  let links = [];

  if (role === 'admin') {
    links = [
      { href: '/admin', label: 'Command Center', icon: Home },
      { href: '/admin/users', label: 'Users & Roles', icon: Users },
      { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    ];
  } else if (role === 'doctor') {
    links = [
      { href: '/doctor', label: 'Dashboard', icon: Home },
    ];
  } else {
    links = [
      { href: '/patient', label: 'Dashboard', icon: Home },
      { href: '/patient/book', label: 'Book Appointment', icon: PlusCircle },
      { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    ];
  }

  const isLinkActive = (href: string) => {
    if (href === '/admin' || href === '/patient' || href === '/doctor') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-1 p-4 space-y-1.5 max-md:flex max-md:flex-row max-md:items-center max-md:justify-around max-md:p-2 max-md:space-y-0">
      {links.map((link) => {
        const active = isLinkActive(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm max-md:flex-col max-md:gap-1 max-md:px-2 max-md:py-1 max-md:text-xs ${
              active
                ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm border border-teal-200/60 max-md:border-none'
                : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'
            }`}
          >
            <Icon
              size={19}
              className={active ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
