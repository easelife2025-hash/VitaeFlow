'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  Settings,
} from 'lucide-react';

const MOBILE_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/resume-builder', label: 'Builder', icon: FileEdit },
  { href: '/ats-checker', label: 'ATS Audit', icon: ShieldCheck },
  { href: '/job-matcher', label: 'Job Match', icon: Target },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1"
    >
      <div className="flex items-center justify-between overflow-x-auto h-16 max-w-2xl mx-auto no-scrollbar">
        {MOBILE_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[48px] min-w-[54px] flex-1 px-1 flex flex-col items-center justify-center rounded-xl transition-colors relative ${
                isActive
                  ? 'text-[#6D5CE8] font-bold'
                  : 'text-slate-500 hover:text-[#18181B]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap shrink-0">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
