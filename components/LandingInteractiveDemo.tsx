'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Wand2,
  ShieldCheck,
  Target,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Check,
} from 'lucide-react';

const DEMO_BULLETS = [
  {
    id: 'frontend',
    role: 'Senior Frontend Engineer',
    raw: 'Worked on improving the checkout page load speed and migrating legacy pages to Next.js.',
    variations: [
      {
        tone: 'Impact & Metrics',
        verb: 'Spearheaded',
        text: 'Spearheaded the migration of core checkout workflows to Next.js App Router, reducing page load latency by 38% while preserving all existing payment integrations.',
      },
      {
        tone: 'Action Leadership',
        verb: 'Architected',
        text: 'Architected and led the frontend transition from legacy templates to modular Next.js components across high-traffic checkout funnels.',
      },
      {
        tone: 'Concise ATS',
        verb: 'Optimized',
        text: 'Optimized checkout page performance and executed Next.js migration to accelerate client-side rendering.',
      },
    ],
  },
  {
    id: 'product',
    role: 'Product Manager',
    raw: 'Managed the onboarding redesign project with designers and engineers to help users finish setup.',
    variations: [
      {
        tone: 'Impact & Metrics',
        verb: 'Directed',
        text: 'Directed cross-functional design and engineering teams to overhaul user onboarding, lifting activation completion rates without altering core account verification steps.',
      },
      {
        tone: 'Action Leadership',
        verb: 'Orchestrated',
        text: 'Orchestrated end-to-end onboarding product discovery and delivery across engineering and UX stakeholders.',
      },
      {
        tone: 'Concise ATS',
        verb: 'Led',
        text: 'Led cross-functional onboarding redesign with UX and engineering to streamline new-user setup.',
      },
    ],
  },
];

export default function LandingInteractiveDemo() {
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [selectedToneIdx, setSelectedToneIdx] = useState(0);
  const [demoTab, setDemoTab] = useState<'ai-builder' | 'ats-checker'>('ai-builder');

  const currentBullet = DEMO_BULLETS[selectedRoleIdx];
  const currentVariation = currentBullet.variations[selectedToneIdx];

  return (
    <section
      id="interactive-demos"
      aria-labelledby="interactive-demos-heading"
      className="no-print bg-[#F8FAFC] border-b border-slate-200 py-16 sm:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Product Demonstrations</span>
            </div>
            <h2
              id="interactive-demos-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18181B] text-balance"
            >
              Experience Our Fact-Safe AI Builder & Deterministic ATS Auditor
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Test how VitaeFlow upgrades real resume bullets without inventing facts, or inspect how our hybrid ATS Checker scores section completeness and keyword alignment.
            </p>
          </div>

          {/* Demo Switcher Buttons */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs self-start">
            <button
              type="button"
              onClick={() => setDemoTab('ai-builder')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                demoTab === 'ai-builder'
                  ? 'bg-[#6D5CE8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#18181B]'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Resume Builder Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoTab('ats-checker')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                demoTab === 'ats-checker'
                  ? 'bg-[#18B89A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#18181B]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ATS & Job Matcher Demo</span>
            </button>
          </div>
        </div>

        {/* Interactive Stage */}
        {demoTab === 'ai-builder' ? (
          <motion.div
            key="ai-builder-demo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left Controls */}
            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <span className="font-display text-sm font-bold text-[#18181B] flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-[#6D5CE8]" />
                    <span>1. Select a Sample Draft Bullet</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#18B89A]">
                    Fact-Preserving AI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO_BULLETS.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRoleIdx(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRoleIdx === idx
                          ? 'border-[#6D5CE8] bg-[#6D5CE8]/5 font-semibold text-[#6D5CE8]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="block text-xs">{item.role}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Original User Input
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                    &ldquo;{currentBullet.raw}&rdquo;
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#18181B] block">
                    2. Choose Gemini Rewrite Style:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {currentBullet.variations.map((v, idx) => (
                      <button
                        key={v.tone}
                        type="button"
                        onClick={() => setSelectedToneIdx(idx)}
                        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selectedToneIdx === idx
                            ? 'bg-[#6D5CE8] text-white border-[#6D5CE8]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {v.tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Never invents metrics or credentials
                </span>
                <Link
                  href="/resume-builder"
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open Full Resume Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ats-checker-demo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left: ATS Checker Audit Mockup */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#18B89A]" />
                    <span className="font-display text-sm font-bold text-[#18181B]">
                      Deterministic ATS Quality Audit (`/ats-checker`)
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs font-bold text-[#18B89A] bg-[#18B89A]/10 px-2.5 py-1 rounded-lg">
                    Est. Score: 92%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      8-Section Check
                    </span>
                    <span className="font-mono text-sm font-bold text-[#18181B]">
                      95 / 100
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      Formatting Audit
                    </span>
                    <span className="font-mono text-sm font-bold text-[#6D5CE8]">
                      90 / 100
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      Quantified Impact
                    </span>
                    <span className="font-mono text-sm font-bold text-[#18B89A]">
                      5 / 6 Bullets
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#18B89A]" />
                      Contact Header, Experience & Education Complete
                    </span>
                    <span className="font-mono text-[11px] text-[#18B89A] font-semibold">
                      Pass
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#18181B]">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      1 bullet point starts with passive phrasing
                    </span>
                    <Link
                      href="/ats-checker"
                      className="font-semibold text-[#6D5CE8] hover:underline"
                    >
                      Fix in Editor →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Deep-links every warning to its editable section
                </span>
                <Link
                  href="/ats-checker"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <span>Open ATS Checker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Job Matcher Demo */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#6D5CE8]" />
                    <span className="font-display text-sm font-bold text-[#18181B]">
                      Job Description Keyword Matcher (`/job-matcher`)
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#6D5CE8]">
                    Deterministic + Gemini Advice
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Matched Target Keywords (Verified in Resume)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'TypeScript',
                      'React',
                      'Next.js',
                      'Tailwind CSS',
                      'CI/CD',
                      'REST APIs',
                      'Core Web Vitals',
                    ].map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18B89A]/10 text-[#18181B] text-xs font-medium"
                      >
                        <Check className="w-3 h-3 text-[#18B89A]" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Missing Relevant Terms (Tap to Add If Truthful)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['GraphQL', 'Playwright', 'WCAG Accessibility'].map((kw) => (
                      <Link
                        key={kw}
                        href="/job-matcher"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 hover:bg-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] hover:text-white transition-colors"
                      >
                        <span>+ {kw}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Compare against any pasted job posting
                </span>
                <Link
                  href="/job-matcher"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <span>Open Job Matcher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
