'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/seo';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="no-print bg-white border-t border-slate-200 py-16 sm:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Heading Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
              Frequently Asked Questions
            </div>
            <h2
              id="faq-heading"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B] text-balance"
            >
              Clear Answers on Fact-Safe AI, ATS Auditing & 1:1 A4 PDF Export
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every feature has its own dedicated workspace page—jump directly into the Resume Builder, ATS Checker, or Job Matcher whenever you are ready.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Link
                href="/resume-builder"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Build My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#18181B] transition-all inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Go to Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-7 divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-[#F8FAFC]/60 overflow-hidden">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.question} className="bg-white">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full min-h-[56px] px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <span className="font-display text-sm sm:text-base font-bold text-[#18181B]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#6D5CE8]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Conversion Call-to-Action Banner */}
        <div className="rounded-3xl border border-[#6D5CE8]/25 bg-gradient-to-r from-[#6D5CE8]/[0.06] via-white to-[#18B89A]/[0.07] p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#18B89A]">
              Ready in Minutes · 1:1 Selectable Vector A4 PDF
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B] text-balance">
              Start Building Your Designer-Grade Resume Today
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Open the dedicated AI Resume Builder, run a deterministic 8-section ATS check, or match your resume against a target job posting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/resume-builder"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-sm sm:text-base font-semibold shadow-md shadow-[#6D5CE8]/20 transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>Build My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/ats-checker"
              className="min-h-[48px] px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200 text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#18B89A]" />
              <span>Run ATS Audit</span>
            </Link>

            <Link
              href="/job-matcher"
              className="min-h-[48px] px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200 text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Target className="w-4 h-4 text-[#6D5CE8]" />
              <span>Job Matcher</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
