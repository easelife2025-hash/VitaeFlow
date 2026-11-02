'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Target, ArrowRight, Info } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';

const EMPLOYERS: {
  name: 'Google' | 'Microsoft' | 'Amazon' | 'Meta' | 'Apple';
  roleLabel: string;
  keySkills: string[];
  sampleJd: string;
  wordmarkClass: string;
}[] = [
  {
    name: 'Google',
    roleLabel: 'Senior Frontend Software Engineer',
    keySkills: ['TypeScript', 'React / Next.js', 'Core Web Vitals', 'WCAG AA'],
    wordmarkClass:
      'font-display font-semibold tracking-[-0.03em] text-xl sm:text-2xl',
    sampleJd: `Role: Senior Frontend Software Engineer (Cloud & Workspace Web Experience)
Responsibilities:
- Design, build, and maintain high-performance, accessible web applications using TypeScript, modern JavaScript, and component-driven architecture.
- Optimize Core Web Vitals, rendering latency, and large-scale data visualization responsiveness across desktop and mobile browsers.
- Collaborate with UX researchers, product managers, and distributed systems engineers to deliver intuitive user workflows.
Qualifications:
- 5+ years of experience with TypeScript, React, Next.js, or Angular, WCAG AA accessibility standards, automated testing (Playwright/Jest), and CI/CD pipelines.`,
  },
  {
    name: 'Microsoft',
    roleLabel: 'Principal Product & UI Engineer',
    keySkills: ['Design Systems', 'TypeScript', 'React', 'Playwright'],
    wordmarkClass:
      'font-sans font-semibold tracking-[-0.02em] text-xl sm:text-[22px]',
    sampleJd: `Role: Principal Frontend & Design Systems Engineer (Productivity Studio)
Responsibilities:
- Architect reusable, accessible UI primitives and design tokens supporting cross-platform web applications.
- Drive AI copilot workflow integration, streaming state management, and keyboard-first accessibility compliance.
- Mentor engineers on TypeScript best practices, bundle optimization, and automated end-to-end testing with Playwright.
Qualifications:
- Proven experience scaling React, TypeScript, Next.js, Tailwind CSS, GraphQL, and enterprise design systems.`,
  },
  {
    name: 'Amazon',
    roleLabel: 'Senior Front-End Engineer (SDE III)',
    keySkills: ['Low-Latency Web', 'React / Next.js', 'Node.js', 'REST APIs'],
    wordmarkClass:
      'font-display font-bold tracking-[-0.03em] text-xl sm:text-2xl lowercase',
    sampleJd: `Role: Senior Front-End Engineer — Customer Experience & High-Scale Commerce
Responsibilities:
- Deliver low-latency, mobile-first web experiences serving millions of daily customers with high availability.
- Partner with product leadership to run A/B experimentation, reduce checkout friction, and improve conversion metrics.
- Own operational excellence, automated Playwright test suites, Core Web Vitals telemetry, and modular TypeScript architecture.
Qualifications:
- 5+ years building production web applications with React, TypeScript, Next.js, Node.js, REST/GraphQL APIs, and cloud infrastructure.`,
  },
  {
    name: 'Meta',
    roleLabel: 'Software Engineer, Product & Web Systems',
    keySkills: ['React 19', 'TypeScript', 'GraphQL', 'Performance Profiling'],
    wordmarkClass:
      'font-display font-bold tracking-[-0.02em] text-xl sm:text-2xl',
    sampleJd: `Role: Software Engineer — Product Web Architecture & Interactive Experiences
Responsibilities:
- Build fast, fluid, and responsive user interfaces using React 19, TypeScript, GraphQL, and modern CSS architecture.
- Lead end-to-end product execution from technical specification to performance profiling and staged rollout.
- Collaborate closely with product designers and data scientists to ship high-engagement social and productivity features.
Qualifications:
- Deep expertise in React, TypeScript, state management, client-side performance optimization, and cross-browser reliability.`,
  },
  {
    name: 'Apple',
    roleLabel: 'Senior Web Applications Engineer',
    keySkills: ['60fps UI Polish', 'TypeScript', 'Tailwind CSS', 'Accessibility'],
    wordmarkClass:
      'font-display font-medium tracking-[-0.025em] text-xl sm:text-2xl',
    sampleJd: `Role: Senior Web Applications Engineer — Interactive Media & Design Systems
Responsibilities:
- Craft refined, accessible, and responsive web applications with meticulous attention to typography, motion, and visual polish.
- Engineer reusable TypeScript and React component systems adhering to strict WCAG accessibility and 60fps interaction budgets.
- Partner across design, hardware/software marketing, and platform engineering teams.
Qualifications:
- Extensive experience with TypeScript, React, Next.js, modern CSS/Tailwind, responsive layout math, and automated testing.`,
  },
];

export default function PopularEmployersSection() {
  const router = useRouter();
  const { activeResume, handleUpdateActiveResume } = useResume();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const selectedEmployer = EMPLOYERS[selectedIdx];

  const handleCompareWithEmployer = (sampleJd: string) => {
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      jobDescriptionDraft: sampleJd,
    });
    router.push('/job-matcher');
  };

  return (
    <section
      aria-labelledby="popular-employers-heading"
      className="no-print bg-white border-b border-slate-200 py-10 sm:py-14"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-1.5">
          <h2
            id="popular-employers-heading"
            className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase text-[#6D5CE8]"
          >
            Target Top-Tier Hiring Standards
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#18181B]">
            Benchmark your resume against public engineering & product role criteria at leading technology companies
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>
              Independent career preparation tool — not affiliated with, endorsed by, or partnered with Google, Microsoft, Amazon, Meta, or Apple.
            </span>
          </p>
        </div>

        {/* 5-Company Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 items-center max-w-5xl mx-auto">
          {EMPLOYERS.map((employer, index) => {
            const isSelected = selectedIdx === index;
            return (
              <motion.button
                key={employer.name}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.06 * index,
                }}
                onClick={() => setSelectedIdx(index)}
                className={`group min-h-[68px] px-4 py-3 rounded-2xl border transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'border-[#6D5CE8] bg-[#6D5CE8]/[0.04] ring-2 ring-[#6D5CE8]/15'
                    : 'border-slate-200/80 bg-[#F8FAFC]/60 hover:bg-white hover:border-[#6D5CE8]/35'
                } ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'text-[#18181B]'
                      : 'text-slate-500 group-hover:text-[#18181B]'
                  }`}
                >
                  {employer.name === 'Google' && (
                    <span className={employer.wordmarkClass}>Google</span>
                  )}

                  {employer.name === 'Microsoft' && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0 opacity-75 group-hover:opacity-100"
                      >
                        <span className="bg-current rounded-[1px]" />
                        <span className="bg-current rounded-[1px]" />
                        <span className="bg-current rounded-[1px]" />
                        <span className="bg-current rounded-[1px]" />
                      </span>
                      <span className={employer.wordmarkClass}>Microsoft</span>
                    </span>
                  )}

                  {employer.name === 'Amazon' && (
                    <span className="inline-flex flex-col items-center leading-none">
                      <span className={employer.wordmarkClass}>amazon</span>
                      <span
                        aria-hidden="true"
                        className="w-10 h-1 border-b-2 border-current rounded-full -mt-0.5 opacity-70"
                      />
                    </span>
                  )}

                  {employer.name === 'Meta' && (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="font-mono font-bold text-lg sm:text-xl leading-none opacity-80"
                      >
                        ∞
                      </span>
                      <span className={employer.wordmarkClass}>Meta</span>
                    </span>
                  )}

                  {employer.name === 'Apple' && (
                    <span className={employer.wordmarkClass}>Apple</span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                    isSelected ? 'text-[#6D5CE8]' : 'text-slate-400'
                  }`}
                >
                  {employer.roleLabel.split(' ').slice(0, 3).join(' ')}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Company Benchmark Preview Strip */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
                {selectedEmployer.name} Benchmark Role:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#18181B]">
                {selectedEmployer.roleLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">
                Core competencies checked:
              </span>
              {selectedEmployer.keySkills.map((sk) => (
                <span
                  key={sk}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCompareWithEmployer(selectedEmployer.sampleJd)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Compare My Resume in Job Matcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
