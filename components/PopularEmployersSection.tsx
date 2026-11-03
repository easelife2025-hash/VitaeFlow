'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';

interface EmployerConfig {
  name: 'Google' | 'Microsoft' | 'Amazon' | 'Meta' | 'Apple';
  roleLabel: string;
  shortRole: string;
  keySkills: string[];
  sampleJd: string;
  wordmarkClass: string;
  brandBadgeText: string;
  topStripClass: string;
  cardBaseClass: string;
  cardActiveClass: string;
  glowHaloClass: string;
  progressBarClass: string;
  liveDotClass: string;
  roleTagActiveClass: string;
  roleTagIdleClass: string;
  benchmarkBorderClass: string;
  benchmarkAccentBarClass: string;
  benchmarkBadgeClass: string;
  skillChipClass: string;
  ctaButtonClass: string;
}

const EMPLOYERS: EmployerConfig[] = [
  {
    name: 'Google',
    roleLabel: 'Senior Frontend Software Engineer',
    shortRole: 'Senior Frontend SWE',
    keySkills: ['TypeScript', 'React / Next.js', 'Core Web Vitals', 'WCAG AA'],
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.03em] text-xl sm:text-2xl',
    brandBadgeText: 'Cloud & Web Experience',
    topStripClass:
      'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]',
    cardBaseClass:
      'border-[#4285F4]/45 bg-gradient-to-b from-[#4285F4]/[0.08] via-white to-[#34A853]/[0.06] hover:border-[#4285F4] shadow-[0_8px_24px_-6px_rgba(66,133,244,0.22)]',
    cardActiveClass:
      'border-2 border-[#4285F4] bg-gradient-to-b from-[#4285F4]/[0.15] via-white to-[#34A853]/[0.10] ring-4 ring-[#4285F4]/20 shadow-[0_18px_40px_-8px_rgba(66,133,244,0.42)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#4285F4]/30 via-[#EA4335]/20 to-[#34A853]/30',
    progressBarClass:
      'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]',
    liveDotClass: 'bg-[#4285F4]',
    roleTagActiveClass: 'text-[#1A73E8]',
    roleTagIdleClass: 'text-[#1A73E8]/85',
    benchmarkBorderClass:
      'border-2 border-[#4285F4]/45 bg-gradient-to-br from-[#4285F4]/[0.08] via-white to-[#34A853]/[0.06] shadow-[0_18px_44px_-12px_rgba(66,133,244,0.28)]',
    benchmarkAccentBarClass:
      'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]',
    benchmarkBadgeClass:
      'bg-[#4285F4]/15 text-[#1A73E8] border border-[#4285F4]/35',
    skillChipClass:
      'border-[#4285F4]/30 bg-white text-[#1E293B] shadow-[0_2px_8px_-2px_rgba(66,133,244,0.18)]',
    ctaButtonClass:
      'bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-[0_8px_22px_-4px_rgba(26,115,232,0.5)]',
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
    shortRole: 'Principal UI Engineer',
    keySkills: ['Design Systems', 'TypeScript', 'React', 'Playwright'],
    wordmarkClass:
      'font-sans font-bold tracking-[-0.02em] text-xl sm:text-[22px] text-[#0078D4]',
    brandBadgeText: 'Productivity & Copilot Studio',
    topStripClass:
      'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF]',
    cardBaseClass:
      'border-[#00A4EF]/45 bg-gradient-to-b from-[#00A4EF]/[0.08] via-white to-[#7FBA00]/[0.06] hover:border-[#00A4EF] shadow-[0_8px_24px_-6px_rgba(0,164,239,0.22)]',
    cardActiveClass:
      'border-2 border-[#00A4EF] bg-gradient-to-b from-[#00A4EF]/[0.15] via-white to-[#7FBA00]/[0.10] ring-4 ring-[#00A4EF]/20 shadow-[0_18px_40px_-8px_rgba(0,164,239,0.42)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#F25022]/25 via-[#7FBA00]/20 to-[#00A4EF]/30',
    progressBarClass:
      'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF]',
    liveDotClass: 'bg-[#00A4EF]',
    roleTagActiveClass: 'text-[#0078D4]',
    roleTagIdleClass: 'text-[#0078D4]/85',
    benchmarkBorderClass:
      'border-2 border-[#00A4EF]/45 bg-gradient-to-br from-[#00A4EF]/[0.08] via-white to-[#7FBA00]/[0.06] shadow-[0_18px_44px_-12px_rgba(0,164,239,0.28)]',
    benchmarkAccentBarClass:
      'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF]',
    benchmarkBadgeClass:
      'bg-[#00A4EF]/15 text-[#0078D4] border border-[#00A4EF]/35',
    skillChipClass:
      'border-[#00A4EF]/30 bg-white text-[#1E293B] shadow-[0_2px_8px_-2px_rgba(0,164,239,0.18)]',
    ctaButtonClass:
      'bg-[#0078D4] hover:bg-[#005A9E] text-white shadow-[0_8px_22px_-4px_rgba(0,120,212,0.5)]',
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
    shortRole: 'Senior Front-End SDE III',
    keySkills: ['Low-Latency Web', 'React / Next.js', 'Node.js', 'REST APIs'],
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.03em] text-xl sm:text-2xl lowercase text-[#232F3E]',
    brandBadgeText: 'High-Scale Commerce & AWS',
    topStripClass:
      'bg-gradient-to-r from-[#FF9900] via-[#FFB84D] to-[#232F3E]',
    cardBaseClass:
      'border-[#FF9900]/50 bg-gradient-to-b from-[#FF9900]/[0.10] via-white to-[#232F3E]/[0.05] hover:border-[#FF9900] shadow-[0_8px_24px_-6px_rgba(255,153,0,0.24)]',
    cardActiveClass:
      'border-2 border-[#FF9900] bg-gradient-to-b from-[#FF9900]/[0.18] via-white to-[#FF9900]/[0.06] ring-4 ring-[#FF9900]/25 shadow-[0_18px_40px_-8px_rgba(255,153,0,0.44)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#FF9900]/30 via-[#FFB84D]/25 to-[#232F3E]/20',
    progressBarClass:
      'bg-gradient-to-r from-[#FF9900] via-[#FFAD33] to-[#232F3E]',
    liveDotClass: 'bg-[#FF9900]',
    roleTagActiveClass: 'text-[#B86800]',
    roleTagIdleClass: 'text-[#D47A00]',
    benchmarkBorderClass:
      'border-2 border-[#FF9900]/50 bg-gradient-to-br from-[#FF9900]/[0.09] via-white to-[#232F3E]/[0.04] shadow-[0_18px_44px_-12px_rgba(255,153,0,0.28)]',
    benchmarkAccentBarClass:
      'bg-gradient-to-r from-[#FF9900] via-[#FFB84D] to-[#232F3E]',
    benchmarkBadgeClass:
      'bg-[#FF9900]/20 text-[#B86800] border border-[#FF9900]/40',
    skillChipClass:
      'border-[#FF9900]/35 bg-white text-[#1E293B] shadow-[0_2px_8px_-2px_rgba(255,153,0,0.20)]',
    ctaButtonClass:
      'bg-[#FF9900] hover:bg-[#E68A00] text-[#111827] font-bold shadow-[0_8px_22px_-4px_rgba(255,153,0,0.5)]',
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
    shortRole: 'Product & Web SWE',
    keySkills: ['React 19', 'TypeScript', 'GraphQL', 'Performance Profiling'],
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.02em] text-xl sm:text-2xl text-[#0668E1]',
    brandBadgeText: 'React & Interactive Systems',
    topStripClass:
      'bg-gradient-to-r from-[#0081FB] via-[#0668E1] to-[#00C6FF]',
    cardBaseClass:
      'border-[#0081FB]/45 bg-gradient-to-b from-[#0081FB]/[0.08] via-white to-[#0668E1]/[0.06] hover:border-[#0081FB] shadow-[0_8px_24px_-6px_rgba(0,129,251,0.22)]',
    cardActiveClass:
      'border-2 border-[#0081FB] bg-gradient-to-b from-[#0081FB]/[0.16] via-white to-[#0668E1]/[0.08] ring-4 ring-[#0081FB]/20 shadow-[0_18px_40px_-8px_rgba(0,129,251,0.42)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#0081FB]/30 via-[#0668E1]/25 to-[#00C6FF]/25',
    progressBarClass:
      'bg-gradient-to-r from-[#0081FB] via-[#0668E1] to-[#00C6FF]',
    liveDotClass: 'bg-[#0081FB]',
    roleTagActiveClass: 'text-[#0668E1]',
    roleTagIdleClass: 'text-[#0081FB]',
    benchmarkBorderClass:
      'border-2 border-[#0081FB]/45 bg-gradient-to-br from-[#0081FB]/[0.08] via-white to-[#0668E1]/[0.05] shadow-[0_18px_44px_-12px_rgba(0,129,251,0.28)]',
    benchmarkAccentBarClass:
      'bg-gradient-to-r from-[#0081FB] via-[#0668E1] to-[#00C6FF]',
    benchmarkBadgeClass:
      'bg-[#0081FB]/15 text-[#0668E1] border border-[#0081FB]/35',
    skillChipClass:
      'border-[#0081FB]/30 bg-white text-[#1E293B] shadow-[0_2px_8px_-2px_rgba(0,129,251,0.18)]',
    ctaButtonClass:
      'bg-[#0081FB] hover:bg-[#0668E1] text-white shadow-[0_8px_22px_-4px_rgba(0,129,251,0.5)]',
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
    shortRole: 'Senior Web Apps SWE',
    keySkills: ['60fps UI Polish', 'TypeScript', 'Tailwind CSS', 'Accessibility'],
    wordmarkClass:
      'font-display font-bold tracking-[-0.025em] text-xl sm:text-2xl text-[#1D1D1F]',
    brandBadgeText: 'Interactive Media & Design',
    topStripClass:
      'bg-gradient-to-r from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6]',
    cardBaseClass:
      'border-[#0071E3]/40 bg-gradient-to-b from-[#0071E3]/[0.07] via-white to-[#1D1D1F]/[0.05] hover:border-[#0071E3] shadow-[0_8px_24px_-6px_rgba(0,113,227,0.20)]',
    cardActiveClass:
      'border-2 border-[#0071E3] bg-gradient-to-b from-[#0071E3]/[0.14] via-white to-[#1D1D1F]/[0.07] ring-4 ring-[#0071E3]/20 shadow-[0_18px_40px_-8px_rgba(0,113,227,0.38)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#1D1D1F]/20 via-[#0071E3]/25 to-[#5E5CE6]/25',
    progressBarClass:
      'bg-gradient-to-r from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6]',
    liveDotClass: 'bg-[#0071E3]',
    roleTagActiveClass: 'text-[#0071E3]',
    roleTagIdleClass: 'text-[#0071E3]/85',
    benchmarkBorderClass:
      'border-2 border-[#0071E3]/45 bg-gradient-to-br from-[#0071E3]/[0.07] via-white to-[#1D1D1F]/[0.05] shadow-[0_18px_44px_-12px_rgba(0,113,227,0.26)]',
    benchmarkAccentBarClass:
      'bg-gradient-to-r from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6]',
    benchmarkBadgeClass:
      'bg-[#0071E3]/15 text-[#0071E3] border border-[#0071E3]/35',
    skillChipClass:
      'border-[#0071E3]/30 bg-white text-[#1D1D1F] shadow-[0_2px_8px_-2px_rgba(0,113,227,0.16)]',
    ctaButtonClass:
      'bg-[#0071E3] hover:bg-[#005BB5] text-white shadow-[0_8px_22px_-4px_rgba(0,113,227,0.48)]',
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
  const [cycleTick, setCycleTick] = useState<number>(0);

  // Continuous startup spotlight cycle every 3.2s (resets timer cleanly when user clicks a card)
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedIdx((prev) => (prev + 1) % EMPLOYERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [cycleTick]);

  const selectedEmployer = EMPLOYERS[selectedIdx];

  const handleSelectCompany = (index: number) => {
    setSelectedIdx(index);
    setCycleTick((prev) => prev + 1);
  };

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
      className="no-print relative overflow-hidden bg-white border-b border-slate-200 py-11 sm:py-16"
    >
      {/* Animated Startup Ambient Mesh Backdrop */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.45, 0.75, 0.45],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-r from-[#4285F4]/[0.07] via-[#FF9900]/[0.07] to-[#0081FB]/[0.07] blur-2xl"
      />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        <div className="flex flex-col items-center text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#6D5CE8]/[0.08] border border-[#6D5CE8]/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8] animate-pulse" />
            <h2
              id="popular-employers-heading"
              className="font-display text-xs font-bold tracking-wider uppercase text-[#6D5CE8]"
            >
              Target Top-Tier Hiring Standards
            </h2>
          </motion.div>

          <p className="text-sm sm:text-base font-semibold text-[#18181B] max-w-2xl">
            Benchmark your resume against public engineering &amp; product role criteria at leading technology companies
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>
              Independent career preparation tool — not affiliated with, endorsed by, or partnered with Google, Microsoft, Amazon, Meta, or Apple.
            </span>
          </p>
        </div>

        {/* 5-Company Official Brand Color Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 items-stretch max-w-5xl mx-auto">
          {EMPLOYERS.map((employer, index) => {
            const isSelected = selectedIdx === index;
            return (
              <motion.button
                key={employer.name}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{
                  opacity: 1,
                  y: isSelected ? -6 : [0, -2.5, 0],
                  scale: isSelected ? 1.035 : 1,
                }}
                whileHover={{ y: -7, scale: 1.045 }}
                whileTap={{ scale: 0.97 }}
                transition={{
                  y: isSelected
                    ? { type: 'spring', stiffness: 360, damping: 24 }
                    : {
                        duration: 2.8 + index * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                  scale: { type: 'spring', stiffness: 380, damping: 24 },
                }}
                onClick={() => handleSelectCompany(index)}
                className={`group relative overflow-hidden min-h-[88px] px-4 py-4 rounded-2xl transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  isSelected ? employer.cardActiveClass : employer.cardBaseClass
                } ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                {/* Always-On Official Brand Color Top Strip */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 inset-x-0 h-1.5 ${employer.topStripClass}`}
                />

                {/* Pulsing Brand Glow Halo */}
                <motion.span
                  aria-hidden="true"
                  animate={{
                    opacity: isSelected ? [0.55, 0.9, 0.55] : [0.25, 0.45, 0.25],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`pointer-events-none absolute -inset-2 blur-xl ${employer.glowHaloClass}`}
                />

                {/* Continuous Startup Shimmer Sweep on Active Card */}
                {isSelected && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '-140%' }}
                    animate={{ x: '240%' }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 0.6,
                      ease: 'easeInOut',
                    }}
                    className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/75 to-transparent"
                  />
                )}

                {/* Live Pulsing Brand Indicator Dot */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${employer.liveDotClass}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${employer.liveDotClass}`}
                    />
                  </span>
                )}

                {/* Official Brand Wordmarks & Icons */}
                <div className="relative z-10 flex items-center justify-center">
                  {employer.name === 'Google' && (
                    <span
                      aria-label="Google"
                      className={employer.wordmarkClass}
                    >
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </span>
                  )}

                  {employer.name === 'Microsoft' && (
                    <span className="inline-flex items-center gap-2">
                      <motion.span
                        aria-hidden="true"
                        animate={
                          isSelected
                            ? { rotate: [0, 6, -4, 0], scale: [1, 1.12, 1] }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 gap-[2px] w-4 h-4 shrink-0"
                      >
                        <span className="bg-[#F25022] rounded-[1px]" />
                        <span className="bg-[#7FBA00] rounded-[1px]" />
                        <span className="bg-[#00A4EF] rounded-[1px]" />
                        <span className="bg-[#FFB900] rounded-[1px]" />
                      </motion.span>
                      <span className={employer.wordmarkClass}>Microsoft</span>
                    </span>
                  )}

                  {employer.name === 'Amazon' && (
                    <span className="inline-flex flex-col items-center leading-none">
                      <span className={employer.wordmarkClass}>amazon</span>
                      <motion.span
                        aria-hidden="true"
                        animate={
                          isSelected
                            ? { scaleX: [0.85, 1.08, 1] }
                            : { scaleX: 1 }
                        }
                        transition={{ duration: 0.5 }}
                        className="w-12 h-1.5 border-b-[3px] border-[#FF9900] rounded-full -mt-0.5"
                      />
                    </span>
                  )}

                  {employer.name === 'Meta' && (
                    <span className="inline-flex items-center gap-1.5">
                      <motion.span
                        aria-hidden="true"
                        animate={
                          isSelected
                            ? { scale: [1, 1.18, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.6 }}
                        className="font-mono font-extrabold text-xl sm:text-2xl leading-none text-[#0081FB]"
                      >
                        ∞
                      </motion.span>
                      <span className={employer.wordmarkClass}>Meta</span>
                    </span>
                  )}

                  {employer.name === 'Apple' && (
                    <span className="inline-flex items-center gap-1.5">
                      <motion.span
                        aria-hidden="true"
                        animate={
                          isSelected
                            ? { scale: [1, 1.2, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.5 }}
                        className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6] shrink-0 shadow-sm"
                      />
                      <span className={employer.wordmarkClass}>Apple</span>
                    </span>
                  )}
                </div>

                {/* Role Subtitle */}
                <span
                  className={`relative z-10 text-[10px] font-bold mt-1.5 whitespace-nowrap transition-colors ${
                    isSelected
                      ? employer.roleTagActiveClass
                      : employer.roleTagIdleClass
                  }`}
                >
                  {employer.shortRole}
                </span>

                {/* Animated Brand Progress Bar on Active Card */}
                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-200/60 overflow-hidden">
                    <motion.div
                      key={`${employer.name}-${cycleTick}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: 3.2,
                        ease: 'linear',
                      }}
                      className={`h-full ${employer.progressBarClass}`}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Animated Selected Company Benchmark Card */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEmployer.name}
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 30,
              }}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${selectedEmployer.benchmarkBorderClass}`}
            >
              {/* Top Brand Accent Bar */}
              <div
                aria-hidden="true"
                className={`absolute top-0 inset-x-0 h-1.5 ${selectedEmployer.benchmarkAccentBarClass}`}
              />

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${selectedEmployer.benchmarkBadgeClass}`}
                  >
                    {selectedEmployer.name} Benchmark
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#18181B]">
                    {selectedEmployer.roleLabel}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400">
                    • {selectedEmployer.brandBadgeText}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">
                    Core competencies checked:
                  </span>
                  {selectedEmployer.keySkills.map((sk, skillIdx) => (
                    <motion.span
                      key={sk}
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: 0.05 * skillIdx,
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${selectedEmployer.skillChipClass}`}
                    >
                      <CheckCircle2 className="w-3 h-3 opacity-80 shrink-0" />
                      <span>{sk}</span>
                    </motion.span>
                  ))}
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  handleCompareWithEmployer(selectedEmployer.sampleJd)
                }
                className={`min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto ${selectedEmployer.ctaButtonClass}`}
              >
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span>Compare My Resume with {selectedEmployer.name}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}


