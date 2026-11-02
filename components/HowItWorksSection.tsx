'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wand2,
  Target,
  Printer,
  ArrowRight,
  Check,
  Play,
  Film,
} from 'lucide-react';

const STEPS = [
  {
    number: '01.',
    title: 'Draft or Import Your Experience',
    subtitle: 'Structured 8-Section Studio',
    description:
      'Enter your work history, education, and skills in clean collapsible cards—or import an existing resume into `/resume-builder`.',
    href: '/resume-builder',
    ctaLabel: 'Open Resume Builder',
    videoSceneImage: '/images/hero-interview-poster.jpg',
    videoDuration: '0:14 Demo Loop',
    beforeLabel: 'Raw Career Notes Input',
    beforeText:
      'Worked on the frontend team building React components and fixing slow pages.',
    afterLabel: 'Structured VitaeFlow Entry',
    afterText:
      'Senior Frontend Engineer · Lumina Cloud Platform · San Francisco, CA (2023 – Present)',
    metricBadge: 'Zero Formatting Headaches',
  },
  {
    number: '02.',
    title: 'Audit ATS Quality & Match Target Jobs',
    subtitle: 'Hybrid Deterministic + Gemini Engine',
    description:
      'Check your 8-section completeness in `/ats-checker`, then compare against any pasted job description in `/job-matcher`.',
    href: '/job-matcher',
    ctaLabel: 'Open Job Matcher',
    videoSceneImage: '/images/hero-interview-scene2.jpg',
    videoDuration: '0:18 Demo Loop',
    beforeLabel: 'Before AI & Keyword Alignment',
    beforeText:
      'Responsible for migrating dashboards to Next.js and improving speed.',
    afterLabel: 'After Fact-Safe AI Rewrite',
    afterText:
      'Spearheaded the migration of core analytics dashboards to Next.js App Router, reducing page load latency by 38%.',
    metricBadge: '96% Target Keyword Match',
  },
  {
    number: '03.',
    title: 'Switch Designer Templates & Export 1:1 PDF',
    subtitle: 'Adaptive A4 Print Engine',
    description:
      'Toggle between Modern Accent, Executive Minimal, and Split Column in `/templates` and download a crisp, selectable A4 PDF.',
    href: '/templates',
    ctaLabel: 'Explore Template Studio',
    videoSceneImage: '/images/hero-interview-scene3.jpg',
    videoDuration: '0:12 Demo Loop',
    beforeLabel: 'Basic HTML Form Output',
    beforeText:
      'Tiny 9pt compressed text with 45% blank whitespace at the bottom of the page.',
    afterLabel: 'VitaeFlow Adaptive A4 Layout',
    afterText:
      '25pt name header, 11pt body typography, 3-column skills grid, and balanced full-page A4 spacing.',
    metricBadge: '1:1 Live Preview & PDF',
  },
];

export default function HowItWorksSection() {
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const activeStep = STEPS[selectedStep];

  return (
    <section
      id="how-it-works"
      aria-label="How VitaeFlow works"
      className="no-print bg-[#F8FAFC] border-b border-slate-200 py-16 sm:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6D5CE8] mb-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>3-Step Interactive Walkthrough</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18181B] text-balance">
              How It Works: From Rough Notes to Interview-Ready A4 PDF
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/resume-builder"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs"
            >
              <span>Build My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 3 Interactive Step Selector Cards */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
            {STEPS.map((step, idx) => {
              const isSelected = selectedStep === idx;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setSelectedStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer text-white ${
                    isSelected
                      ? 'bg-[#6D5CE8] border-white shadow-md ring-2 ring-[#6D5CE8]/30'
                      : 'bg-[#6D5CE8]/90 border-[#6D5CE8] hover:bg-[#6D5CE8]'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-white">
                      <span className="font-mono text-[#18B89A] mr-2">
                        {step.number}
                      </span>
                      {step.title}
                    </h3>
                    <span className="text-xs font-semibold text-white/90 shrink-0">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Demonstration Video & Transformation Stage */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            {/* Short Visual Video Stage Banner */}
            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#090A0F] border border-slate-200">
              <video
                src="/videos/hero-interview.mp4"
                poster={activeStep.videoSceneImage}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/45 to-transparent" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/15">
                  <Play className="w-3 h-3 text-[#18B89A] fill-[#18B89A]" />
                  <span>Step {activeStep.number} Live Demonstration</span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#18B89A] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                  {activeStep.videoDuration}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                <div>
                  <span className="text-[11px] text-[#18B89A] font-bold uppercase tracking-wider block">
                    {activeStep.subtitle}
                  </span>
                  <h4 className="font-display text-sm sm:text-base font-bold">
                    {activeStep.title}
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold text-white bg-[#6D5CE8] px-2.5 py-1 rounded-lg shrink-0">
                  {activeStep.metricBadge}
                </span>
              </div>
            </div>

            {/* Before & After Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  {activeStep.beforeLabel}
                </span>
                <p className="text-xs sm:text-sm text-slate-500 line-through leading-relaxed">
                  {activeStep.beforeText}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#6D5CE8]/[0.04] border border-[#6D5CE8]/25 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D5CE8]">
                  <Check className="w-3.5 h-3.5 text-[#18B89A]" />
                  <span>{activeStep.afterLabel}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#18181B] leading-relaxed">
                  {activeStep.afterText}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {selectedStep === 0 && (
                  <Wand2 className="w-4 h-4 text-[#6D5CE8]" />
                )}
                {selectedStep === 1 && (
                  <Target className="w-4 h-4 text-[#18B89A]" />
                )}
                {selectedStep === 2 && (
                  <Printer className="w-4 h-4 text-[#6D5CE8]" />
                )}
                <span>Ready to try Step {selectedStep + 1} on its dedicated page?</span>
              </div>
              <Link
                href={activeStep.href}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>{activeStep.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
