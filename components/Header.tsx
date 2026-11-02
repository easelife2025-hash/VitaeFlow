'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Printer,
  LayoutGrid,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  Settings,
  Sparkles,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Menu,
  BookOpen,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { evaluateResumeDeterministically } from '@/lib/ats-deterministic';

const APP_ROUTES = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/resume-builder', label: 'Resume Builder', icon: FileEdit },
  { href: '/ats-checker', label: 'ATS Checker', icon: ShieldCheck },
  { href: '/job-matcher', label: 'Job Matcher', icon: Target },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/blog', label: 'Guides', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeResume,
    drafts,
    openDraftsModal,
    handleExportPdf,
    setIsMobileDrawerOpen,
  } = useResume();

  const isLandingPage = pathname === '/';

  const deterministic = React.useMemo(
    () =>
      evaluateResumeDeterministically(
        activeResume,
        activeResume.jobDescriptionDraft || ''
      ),
    [activeResume]
  );

  const displayedScore =
    activeResume.atsAnalysis?.score ?? deterministic.estimatedQualityScore;

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (pathname === '/dashboard') {
      router.push('/');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Menu Trigger, Back Button (on internal pages), Brand Wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile / Tablet Slide-Out Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open side navigation menu"
            title="Open navigation menu"
            className="lg:hidden min-h-[38px] min-w-[38px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8]/40 text-slate-700 hover:text-[#6D5CE8] flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Visible Back Button on Every Internal Page */}
          {!isLandingPage && (
            <button
              type="button"
              onClick={handleBackNavigation}
              title="Go back to previous page"
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8]/50 hover:bg-slate-50 text-xs font-semibold text-[#18181B] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
              <span>Back</span>
            </button>
          )}

          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tight text-[#18181B] flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5CE8] rounded-lg"
          >
            <span className="w-7 h-7 rounded-lg bg-[#6D5CE8] text-white flex items-center justify-center shadow-xs shadow-[#6D5CE8]/25">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="hidden xs:inline sm:inline">
              Vitae<span className="text-[#6D5CE8]">Flow</span>
            </span>
          </Link>

          {!isLandingPage && (
            <button
              type="button"
              onClick={openDraftsModal}
              title="Switch active resume draft"
              className="hidden xl:inline-flex items-center gap-2 pl-2.5 pr-3 py-1 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-[#6D5CE8]/40 text-xs transition-all max-w-[220px] cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
              <span className="font-semibold text-[#18181B] truncate">
                {activeResume.title}
              </span>
              <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded bg-[#18B89A]/15 text-[#18181B] font-bold shrink-0">
                {displayedScore}%
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Landing Page Top Navigation Links (Internal pages use Collapsible Left Sidebar) */}
        {isLandingPage && (
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium text-slate-600"
          >
            <Link
              href="/"
              className="px-3 py-2 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] font-semibold transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            {APP_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-xl hover:text-[#18181B] hover:bg-slate-100/80 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Context-Aware Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLandingPage && (
            <button
              type="button"
              onClick={openDraftsModal}
              className="xl:hidden min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span className="hidden sm:inline">Resumes</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-500">
                ({drafts.length})
              </span>
            </button>
          )}

          {isLandingPage ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#6D5CE8]/40 bg-white text-xs sm:text-sm font-semibold text-[#18181B] items-center gap-1.5 transition-all whitespace-nowrap"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#6D5CE8]" />
                <span>Open Dashboard</span>
              </Link>
              <Link
                href="/resume-builder"
                className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#6D5CE8] rounded-xl hover:bg-[#5B4AD6] active:scale-[0.98] transition-all shadow-sm shadow-[#6D5CE8]/25 flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Build My Resume</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleExportPdf()}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#6D5CE8] rounded-xl hover:bg-[#5B4AD6] active:scale-[0.98] transition-all shadow-sm shadow-[#6D5CE8]/20 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
