'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Printer,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  FileCheck2,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';

export default function Footer() {
  const pathname = usePathname();
  const { handleExportPdf } = useResume();
  const [upcomingNotice, setUpcomingNotice] = useState<string | null>(null);

  if (pathname !== '/') {
    return null;
  }

  return (
    <footer className="no-print bg-white border-t border-slate-200 pt-14 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {upcomingNotice && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#6D5CE8]/10 border border-[#6D5CE8]/25 text-xs text-[#18181B]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6D5CE8] shrink-0" />
              <span>
                <strong>{upcomingNotice}</strong> is on our upcoming product
                roadmap. All core AI Resume Builder, ATS Checker, Job Matcher,
                Templates, and Settings pages are live right now.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUpcomingNotice(null)}
              className="text-xs font-semibold text-[#6D5CE8] hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Column 1: Brand, Mission & Primary CTAs (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="font-display text-lg font-extrabold tracking-tight text-[#18181B] inline-flex items-center gap-2"
            >
              <span className="w-7 h-7 rounded-lg bg-[#6D5CE8] text-white flex items-center justify-center shadow-xs shadow-[#6D5CE8]/25">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>
                Vitae<span className="text-[#6D5CE8]">Flow</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              Startup-grade AI Resume Studio, Deterministic ATS Auditor, and
              Target Job Description Keyword Matcher. Built with strict
              fact-preserving guardrails and 1:1 vector A4 PDF export.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <Link
                href="/resume-builder"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Build My Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleExportPdf()}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-[#18181B] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#6D5CE8]" />
                <span>Download A4 PDF</span>
              </button>
            </div>
          </div>

          {/* Column 2: Application Pages (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
              Application Pages
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Resume Dashboard (`/dashboard`)
                </Link>
              </li>
              <li>
                <Link
                  href="/resume-builder"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  AI Resume Builder (`/resume-builder`)
                </Link>
              </li>
              <li>
                <Link
                  href="/ats-checker"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  ATS Quality Checker (`/ats-checker`)
                </Link>
              </li>
              <li>
                <Link
                  href="/job-matcher"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Target Job Matcher (`/job-matcher`)
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  A4 Template Studio (`/templates`)
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  ATS & Career Guides (`/blog`)
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Settings & Privacy (`/settings`)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Landing Overview & SEO Guides (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
              Product & Guides
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Feature Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#interactive-demos"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Interactive Demos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/how-to-pass-ats-resume-screening"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  ATS Parsing Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/quantified-resume-bullet-points-action-verbs"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  Action-Verb Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-[#6D5CE8] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Roadmap & Trust Architecture (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
              Security & Roadmap
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
                <span>Server-Side Gemini API Proxy</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                <span>Zero Fabricated Facts Guardrail</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
                <span>Local-First Browser Storage</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <button
                type="button"
                onClick={() =>
                  setUpcomingNotice('LinkedIn URL Profile Importer')
                }
                className="block hover:text-[#18181B] transition-colors text-left cursor-pointer"
              >
                LinkedIn URL Import ·{' '}
                <span className="text-[#6D5CE8] font-medium">Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => setUpcomingNotice('AI Cover Letter Studio')}
                className="block hover:text-[#18181B] transition-colors text-left cursor-pointer"
              >
                AI Cover Letter Studio ·{' '}
                <span className="text-[#6D5CE8] font-medium">Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
