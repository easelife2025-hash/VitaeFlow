import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileQuestion,
  Home,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '404 – Page Not Found',
  description:
    'The page you are looking for could not be found. Return to the VitaeFlow AI Resume Builder, ATS Checker, Job Matcher, or Career Guides.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex-1 bg-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xs text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6D5CE8]/10 border border-[#6D5CE8]/20 text-[#6D5CE8] mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-slate-100 text-slate-600">
            HTTP 404 · Route Not Found
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18181B]">
            We Couldn’t Find That Page
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            The link may be outdated or the URL may have been mistyped. Your
            saved resume drafts are still safely stored in your browser—jump
            directly to any workspace tool below.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>
          <Link
            href="/resume-builder"
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs sm:text-sm font-semibold text-[#18181B] transition-all inline-flex items-center gap-2"
          >
            <FileEdit className="w-4 h-4 text-[#6D5CE8]" />
            <span>Open AI Resume Builder</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 text-left">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
            Explore Public VitaeFlow Tools & Career Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/ats-checker"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#18B89A] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-[#18181B]">
                    ATS Quality Checker
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Audit 8 sections & formatting rules
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>

            <Link
              href="/job-matcher"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-[#6D5CE8] shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-[#18181B]">
                    Target Job Matcher
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Compare resume vs. job description
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>

            <Link
              href="/templates"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <LayoutTemplate className="w-4 h-4 text-[#6D5CE8] shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-[#18181B]">
                    A4 Template Studio
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    6 ATS-friendly designer CV layouts
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>

            <Link
              href="/blog"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#18B89A] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#18B89A] shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-[#18181B]">
                    ATS & Resume Guides
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Action verbs, keywords & formatting tips
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
