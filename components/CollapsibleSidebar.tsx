'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FolderOpen,
  Printer,
  Sparkles,
  BookOpen,
  User as UserIcon,
  Mail,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { evaluateResumeDeterministically } from '@/lib/ats-deterministic';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home, badge: '' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, badge: '' },
  {
    href: '/resume-builder',
    label: 'Resume Builder',
    icon: FileEdit,
    badge: 'Studio',
  },
  { href: '/ats-checker', label: 'ATS Checker', icon: ShieldCheck, badge: '' },
  { href: '/job-matcher', label: 'Job Matcher', icon: Target, badge: '' },
  {
    href: '/templates',
    label: 'Templates',
    icon: LayoutTemplate,
    badge: '6 Layouts',
  },
  { href: '/blog', label: 'ATS Guides', icon: BookOpen, badge: '' },
  { href: '/settings', label: 'Settings', icon: Settings, badge: '' },
];

const MOBILE_BOTTOM_TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/resume-builder', label: 'Builder', icon: FileEdit },
  { href: '/ats-checker', label: 'ATS Check', icon: ShieldCheck },
  { href: '/job-matcher', label: 'Matcher', icon: Target },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
];

export default function CollapsibleSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeResume,
    drafts,
    openDraftsModal,
    handleExportPdf,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    user,
    handleSignOut,
  } = useResume();

  const isLandingPage = pathname === '/' || pathname === '/login';

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

  // Resolve authenticated user's name and email (with fallback to active resume personalInfo)
  const userName =
    user?.displayName?.trim() ||
    activeResume.personalInfo.fullName?.trim() ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'VitaeFlow User';

  const userEmail =
    user?.email?.trim() ||
    activeResume.personalInfo.email?.trim() ||
    'Sign in to sync across devices';

  const userInitials = React.useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase() || 'VF';
  }, [userName]);

  return (
    <>
      {/* Desktop Collapsible Left Sidebar (Shown on all internal workspace pages) */}
      {!isLandingPage && (
        <aside
          aria-label="Workspace side navigation"
          className={`no-print hidden lg:flex flex-col shrink-0 bg-white border-r border-slate-200/90 sticky top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-200 select-none ${
            isSidebarCollapsed ? 'w-[76px]' : 'w-[260px]'
          }`}
        >
          {/* Top Collapse Toggle, User Profile Card & Active Resume Switcher */}
          <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'
              }`}
            >
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CV Studio Menu
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                title={
                  isSidebarCollapsed ? 'Expand side menu' : 'Collapse side menu'
                }
                aria-label={
                  isSidebarCollapsed ? 'Expand side menu' : 'Collapse side menu'
                }
                className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-[#6D5CE8] flex items-center justify-center transition-colors cursor-pointer"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* User Name & Email Profile Button */}
            <button
              type="button"
              onClick={() => router.push(user ? '/settings' : '/login')}
              title={`${userName} (${userEmail})`}
              className={`w-full rounded-xl border border-slate-200/90 bg-gradient-to-br from-[#6D5CE8]/[0.06] to-[#F8FAFC] hover:border-[#6D5CE8]/50 transition-all cursor-pointer flex items-center ${
                isSidebarCollapsed
                  ? 'justify-center p-2'
                  : 'justify-between gap-2.5 px-3 py-2.5 text-left'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#6D5CE8] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  {userInitials}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#18181B] truncate">
                      {userName}
                    </span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {userEmail}
                    </span>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <span className="w-2 h-2 rounded-full bg-[#18B89A] shrink-0" />
              )}
            </button>

            {/* Active Draft Switcher */}
            <button
              type="button"
              onClick={openDraftsModal}
              title={`Active Draft: ${activeResume.title} (${displayedScore}% Quality)`}
              className={`w-full rounded-xl border border-slate-200/90 bg-[#F8FAFC] hover:border-[#6D5CE8]/40 transition-all cursor-pointer flex items-center ${
                isSidebarCollapsed
                  ? 'justify-center p-2'
                  : 'justify-between gap-2 px-3 py-2 text-left'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-[#18181B] truncate">
                      {activeResume.title}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {drafts.length} saved draft{drafts.length === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded-md bg-[#18B89A]/15 text-[#18181B] font-bold shrink-0">
                  {displayedScore}%
                </span>
              )}
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`min-h-[42px] rounded-xl transition-all flex items-center ${
                    isSidebarCollapsed
                      ? 'justify-center px-2'
                      : 'justify-between px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#6D5CE8] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-100/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="text-xs truncate">{item.label}</span>
                    )}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#6D5CE8]/10 text-[#6D5CE8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Export Action */}
          <div className="p-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleExportPdf()}
              title="Download 1:1 A4 PDF"
              className={`w-full min-h-[42px] rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSidebarCollapsed ? 'px-2' : 'px-3.5 py-2.5'
              }`}
            >
              <Printer className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Download A4 PDF</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile & Tablet Slide-Out Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-Out Drawer Panel */}
          <div className="relative z-10 w-[300px] max-w-[86vw] bg-white h-full shadow-2xl border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="px-4 h-16 border-b border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="font-display text-base font-extrabold tracking-tight text-[#18181B] flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#6D5CE8] text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    Vitae<span className="text-[#6D5CE8]">Flow</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:text-[#18181B] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selected Component: User Name & Email Card + Active Draft Selector */}
              <div className="p-4 border-b border-slate-100 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    router.push(user ? '/settings' : '/login');
                  }}
                  className="w-full p-3.5 rounded-2xl border border-[#6D5CE8]/25 bg-gradient-to-br from-[#6D5CE8]/[0.07] via-white to-[#18B89A]/[0.05] hover:border-[#6D5CE8]/50 text-left flex items-center justify-between gap-3 cursor-pointer shadow-2xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#6D5CE8] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#18181B] truncate">
                        <UserIcon className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                        <span className="truncate">{userName}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{userEmail}</span>
                      </span>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-[10px] px-2 py-0.5 rounded-md bg-[#18B89A]/15 text-[#0F766E] font-bold shrink-0">
                    {user ? 'Synced' : 'Sign In'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    openDraftsModal();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-[#6D5CE8]/40 text-left flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderOpen className="w-4 h-4 text-[#6D5CE8] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#18181B] truncate">
                        {activeResume.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Switch or create resume ({drafts.length})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded bg-[#18B89A]/15 text-[#18181B] font-bold shrink-0">
                    {displayedScore}%
                  </span>
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#6D5CE8] text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs sm:text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#6D5CE8]/10 text-[#6D5CE8]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleExportPdf();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Download 1:1 A4 PDF</span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileDrawerOpen(false);
                    await handleSignOut();
                    router.push('/');
                  }}
                  className="w-full min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({user.email})</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full min-h-[40px] px-4 py-2 rounded-xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 text-[#6D5CE8] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick-Navigation Bar (Shown on internal workspace routes for one-hand thumb navigation) */}
      {!isLandingPage && (
        <nav
          aria-label="Mobile workspace bottom navigation"
          className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1.5 py-1 grid grid-cols-5 gap-1 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
        >
          {MOBILE_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isActive
                    ? 'text-[#6D5CE8] bg-[#6D5CE8]/10 font-bold'
                    : 'text-slate-500 hover:text-[#18181B] font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#6D5CE8]' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] leading-tight truncate max-w-full">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
