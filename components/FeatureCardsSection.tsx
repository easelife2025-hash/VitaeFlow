'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Wand2,
  ShieldCheck,
  Target,
  LayoutTemplate,
  ArrowRight,
  Check,
  Sparkles,
  CheckCircle2,
  Zap,
  FileText,
} from 'lucide-react';

/* ==========================================================================
   Lightweight Floating Particles (Pure CSS GPU-Animated, Paused Off-Screen)
   ========================================================================== */
const AMBIENT_PARTICLES = [
  { id: 1, top: '12%', left: '8%', size: 6, color: '#6D5CE8', delay: '0s', duration: '6.5s' },
  { id: 2, top: '22%', left: '88%', size: 8, color: '#18B89A', delay: '1.2s', duration: '7.2s' },
  { id: 3, top: '48%', left: '4%', size: 7, color: '#18B89A', delay: '2.1s', duration: '8s' },
  { id: 4, top: '65%', left: '94%', size: 6, color: '#6D5CE8', delay: '0.7s', duration: '6.8s' },
  { id: 5, top: '84%', left: '14%', size: 8, color: '#6D5CE8', delay: '1.8s', duration: '7.5s' },
  { id: 6, top: '16%', left: '52%', size: 5, color: '#18B89A', delay: '2.6s', duration: '6.2s' },
];

/* ==========================================================================
   3D Tilt Card Wrapper (Zero React Re-Renders on Pointer Move)
   ========================================================================== */
function InteractiveTiltCard({
  children,
  index,
  accentColor,
  prefersReducedMotion,
}: {
  children: React.ReactNode;
  index: number;
  accentColor: string;
  prefersReducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || e.pointerType === 'touch') return;
      const el = cardRef.current;
      if (!el) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        const rotateY = ((x - 0.5) * 4.5).toFixed(2);
        const rotateX = ((0.5 - y) * 4.5).toFixed(2);
        el.style.setProperty('--rx', `${rotateX}deg`);
        el.style.setProperty('--ry', `${rotateY}deg`);
      });
    },
    [prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isViolet = accentColor === '#6D5CE8';

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay: index * 0.09,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`feature-saas-card group rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-6 overflow-hidden ${
        isViolet
          ? 'border-[#6D5CE8]/20 hover:border-[#6D5CE8]/55'
          : 'border-[#18B89A]/25 hover:border-[#18B89A]/60'
      }`}
    >
      {/* Top Animated Gradient Accent Line */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-6 right-6 h-[3px] rounded-b-full opacity-75 group-hover:opacity-100 transition-opacity ${
          isViolet
            ? 'bg-gradient-to-r from-[#6D5CE8] via-[#8B5CF6] to-[#18B89A]'
            : 'bg-gradient-to-r from-[#18B89A] via-[#2DD4BF] to-[#6D5CE8]'
        }`}
      />

      {/* Subtle Corner Ambient Glow on Hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
          isViolet ? 'bg-[#6D5CE8]' : 'bg-[#18B89A]'
        }`}
      />

      {children}
    </motion.div>
  );
}

/* ==========================================================================
   1. Card 01 Live Stage: AI Resume Builder (Before -> After Bullet Studio)
   ========================================================================== */
const AI_SIM_MODES = [
  {
    tone: 'Impact & Metrics',
    verb: 'Engineered',
    raw: 'Worked on frontend components and improved page load speed.',
    rewritten:
      'reusable React components and streamlined rendering performance, cutting checkout latency by 38%.',
    badge: 'Facts Preserved',
  },
  {
    tone: 'Action Leadership',
    verb: 'Architected',
    raw: 'Helped the team migrate legacy pages and mentored junior engineers.',
    rewritten:
      'modular Next.js design system and led cross-functional migration across 4 product squads.',
    badge: 'Executive Tone',
  },
  {
    tone: 'Concise ATS',
    verb: 'Spearheaded',
    raw: 'Responsible for API integrations and fixing slow database queries.',
    rewritten:
      'REST API optimization and query indexing, reducing p95 response times while maintaining 100% accuracy.',
    badge: 'ATS Optimized',
  },
];

function LiveAiBuilderStage({
  isActive,
  prefersReducedMotion,
}: {
  isActive: boolean;
  prefersReducedMotion: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % AI_SIM_MODES.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [isActive, prefersReducedMotion]);

  const current = AI_SIM_MODES[activeIdx];

  return (
    <div className="relative rounded-2xl border border-[#6D5CE8]/15 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F5F3FF] p-4 space-y-3 overflow-hidden">
      {/* GPU ScaleX Progress Indicator */}
      {!prefersReducedMotion && isActive && (
        <motion.div
          key={`ai-prog-${activeIdx}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3.6, ease: 'linear' }}
          className="absolute top-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-[#6D5CE8] to-[#18B89A]"
        />
      )}

      {/* Header & Interactive Tone Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {AI_SIM_MODES.map((mode, idx) => {
            const selected = idx === activeIdx;
            return (
              <button
                key={mode.tone}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selected
                    ? 'bg-[#6D5CE8] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#18181B]'
                }`}
              >
                {mode.tone}
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18B89A]">
          <Zap className="w-3 h-3" />
          <span>{current.badge}</span>
        </span>
      </div>

      {/* Fixed-Height Stage to Prevent Layout Shift */}
      <div className="min-h-[88px] flex flex-col justify-between space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.tone}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-2 text-[11.5px]">
              <span className="text-slate-400 line-through truncate">
                {current.raw}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                Before → After
              </span>
            </div>

            <div className="rounded-xl bg-[#6D5CE8]/[0.06] border border-[#6D5CE8]/20 p-2.5">
              <p className="text-xs text-[#18181B] font-medium leading-relaxed">
                <strong className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#6D5CE8] text-white text-[11px] font-semibold mr-1.5">
                  {current.verb}
                </strong>
                {current.rewritten}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. Card 02 Live Stage: ATS Quality Checker (Animated Score & Progress Bars)
   ========================================================================== */
const ATS_STAGES = [
  {
    completeness: 95,
    formatting: 92,
    overall: 94,
    statusLabel: '8/8 Core Sections Verified',
  },
  {
    completeness: 98,
    formatting: 95,
    overall: 96,
    statusLabel: 'Quantified Impact & Action Verbs Passed',
  },
  {
    completeness: 95,
    formatting: 92,
    overall: 95,
    statusLabel: '100% Selectable Vector A4 Text',
  },
];

function LiveAtsCheckerStage({
  isActive,
  prefersReducedMotion,
}: {
  isActive: boolean;
  prefersReducedMotion: boolean;
}) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % ATS_STAGES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [isActive, prefersReducedMotion]);

  const current = ATS_STAGES[stageIdx];
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset =
    circumference - (current.overall / 100) * circumference;

  return (
    <div
      onClick={() => setStageIdx((prev) => (prev + 1) % ATS_STAGES.length)}
      className="rounded-2xl border border-[#18B89A]/20 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0FDFA] p-4 min-h-[132px] flex flex-col justify-between space-y-3 cursor-pointer select-none"
      title="Click to cycle ATS audit metrics"
    >
      <div className="flex items-center gap-4">
        {/* Animated Circular Score Ring */}
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 52 52">
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="4.5"
            />
            <motion.circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke="#18B89A"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xs font-extrabold text-[#18181B] tabular-nums">
              {current.overall}%
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#18B89A]">
              Score
            </span>
          </div>
        </div>

        {/* GPU-Friendly Animated Progress Bars (scaleX) */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#18181B]">
                Section Completeness (8/8)
              </span>
              <span className="font-mono font-bold text-[#18B89A] tabular-nums">
                {current.completeness}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0.7 }}
                animate={{ scaleX: current.completeness / 100 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full origin-left bg-gradient-to-r from-[#18B89A] to-[#2DD4BF] rounded-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#18181B]">
                Formatting & Action Verbs
              </span>
              <span className="font-mono font-bold text-[#6D5CE8] tabular-nums">
                {current.formatting}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0.7 }}
                animate={{ scaleX: current.formatting / 100 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full origin-left bg-gradient-to-r from-[#6D5CE8] to-[#18B89A] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Audit Status Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#18181B]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
          <span>{current.statusLabel}</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">Live Audit</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. Card 03 Live Stage: Target Job Matcher (Animated Keyword Tags & Stats)
   ========================================================================== */
const JOB_KEYWORDS = [
  { label: 'TypeScript', baseMatched: true },
  { label: 'React', baseMatched: true },
  { label: 'Next.js', baseMatched: true },
  { label: 'CI/CD', baseMatched: true },
  { label: 'GraphQL', unlockAt: 1 },
  { label: 'Playwright', unlockAt: 2 },
];

function LiveJobMatcherStage({
  isActive,
  prefersReducedMotion,
}: {
  isActive: boolean;
  prefersReducedMotion: boolean;
}) {
  const [bonusStep, setBonusStep] = useState(0);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setBonusStep((prev) => (prev + 1) % 3);
    }, 3100);
    return () => clearInterval(timer);
  }, [isActive, prefersReducedMotion]);

  const matchedCount = 12 + bonusStep;
  const missingCount = 2 - bonusStep;

  return (
    <div
      onClick={() => setBonusStep((prev) => (prev + 1) % 3)}
      className="rounded-2xl border border-[#18B89A]/20 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0FDFA] p-4 min-h-[132px] flex flex-col justify-between space-y-3 cursor-pointer select-none"
      title="Click to simulate adding missing job keywords"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-600">
          Target Job Keyword Overlap
        </span>
        <span className="font-mono font-bold text-[#18B89A] tabular-nums">
          {matchedCount} Matched · {missingCount} Missing
        </span>
      </div>

      {/* Smoothly Animated Keyword Tags */}
      <div className="flex flex-wrap gap-1.5">
        {JOB_KEYWORDS.map((kw) => {
          const isMatched =
            kw.baseMatched || (kw.unlockAt !== undefined && bonusStep >= kw.unlockAt);
          return (
            <motion.span
              key={kw.label}
              layout
              initial={false}
              animate={{
                scale: isMatched ? 1 : 0.97,
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isMatched
                  ? 'bg-[#18B89A]/15 text-[#0F766E] border border-[#18B89A]/30'
                  : 'bg-white text-[#6D5CE8] border border-dashed border-[#6D5CE8]/45 hover:bg-[#6D5CE8]/5'
              }`}
            >
              {isMatched ? (
                <>
                  <Check className="w-3 h-3 text-[#18B89A] stroke-[2.5]" />
                  <span>{kw.label}</span>
                </>
              ) : (
                <span>+ {kw.label}</span>
              )}
            </motion.span>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
        <span>Tap any missing skill to test instant alignment</span>
        <span className="font-mono font-semibold text-[#6D5CE8] tabular-nums">
          {Math.round((matchedCount / 14) * 100)}% Match
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. Card 04 Live Stage: Designer A4 Templates (Interactive Template Gallery)
   ========================================================================== */
const TEMPLATE_MODES = [
  {
    id: 'modern',
    label: 'Modern Accent',
    spec: '25pt Left Header · Violet Accent Rule',
  },
  {
    id: 'executive',
    label: 'Executive',
    spec: '24pt Centered Serif Header · Classic Rule',
  },
  {
    id: 'split',
    label: 'Split Column',
    spec: 'Asymmetric 2-Column Technical Sidebar',
  },
];

function LiveTemplateStage({
  isActive,
  prefersReducedMotion,
}: {
  isActive: boolean;
  prefersReducedMotion: boolean;
}) {
  const [activeTpl, setActiveTpl] = useState(0);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveTpl((prev) => (prev + 1) % TEMPLATE_MODES.length);
    }, 3300);
    return () => clearInterval(timer);
  }, [isActive, prefersReducedMotion]);

  return (
    <div className="rounded-2xl border border-[#6D5CE8]/15 bg-gradient-to-br from-[#F8FAFC] via-white to-[#F5F3FF] p-4 min-h-[132px] flex flex-col justify-between space-y-3">
      <div className="grid grid-cols-3 gap-2.5 text-[10px]">
        {TEMPLATE_MODES.map((tpl, idx) => {
          const isSelected = idx === activeTpl;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setActiveTpl(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'border-[#6D5CE8] bg-white shadow-xs ring-2 ring-[#6D5CE8]/15 -translate-y-0.5'
                  : 'border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300'
              }`}
            >
              {tpl.id === 'modern' && (
                <div className="space-y-1">
                  <div className="h-1.5 w-12 bg-[#6D5CE8] rounded" />
                  <div className="h-1 w-full bg-slate-200 rounded" />
                  <div className="h-1 w-4/5 bg-slate-200 rounded" />
                </div>
              )}
              {tpl.id === 'executive' && (
                <div className="space-y-1">
                  <div className="h-1.5 w-12 mx-auto bg-slate-700 rounded" />
                  <div className="h-1 w-full bg-slate-200 rounded" />
                  <div className="h-1 w-4/5 mx-auto bg-slate-200 rounded" />
                </div>
              )}
              {tpl.id === 'split' && (
                <div className="space-y-1">
                  <div className="h-1.5 w-12 bg-[#18B89A] rounded" />
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-2 bg-[#18B89A]/25 rounded" />
                    <div className="col-span-2 h-2 bg-slate-200 rounded" />
                  </div>
                </div>
              )}
              <span
                className={`block font-bold pt-0.5 truncate ${
                  isSelected
                    ? 'text-[#6D5CE8]'
                    : 'text-slate-600'
                } ${tpl.id === 'executive' ? 'text-center' : ''}`}
              >
                {tpl.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-200/60">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#18181B] truncate">
          <FileText className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
          <span>{TEMPLATE_MODES[activeTpl].spec}</span>
        </span>
        <span className="font-mono text-[10px] font-semibold text-[#18B89A] shrink-0">
          1:1 Vector PDF
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   Main FeatureCardsSection Component
   ========================================================================== */
export default function FeatureCardsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(true);
  const prefersReducedMotion = Boolean(useReducedMotion());

  // Pause continuous timers and CSS animations when scrolled off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '120px 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      index: '01.',
      title: 'AI Resume Builder',
      kicker: 'Fact-Safe Action-Verb & Summary Studio',
      description:
        'Turn rough bullet points into executive-ready achievement statements. Choose between Impact & Metrics, Action Leadership, or Concise ATS tones powered by server-side Gemini AI.',
      highlights: [
        'Preserves 100% of your facts—never invents credentials or metrics',
        'Generates 3 tailored variations per bullet point in seconds',
        'Includes AI Summary Generator & Grounded Skill Suggester',
      ],
      metricLabel: 'Dedicated /resume-builder Route',
      ctaText: 'Open AI Resume Builder',
      href: '/resume-builder',
      icon: Wand2,
      accentColor: '#6D5CE8',
      mockupType: 'ai-writer' as const,
    },
    {
      index: '02.',
      title: 'ATS Quality Checker',
      kicker: 'Deterministic 8-Section & Formatting Audit',
      description:
        'Audit your resume against measurable Applicant Tracking System rules before you apply. Inspect Section Completeness, Formatting Warnings, and Quantified Bullet density.',
      highlights: [
        'Calculates transparent 0–100% Estimated Resume Quality Score',
        'Audits all 8 resume sections with deep links to fix warnings',
        'Detects passive phrasing, short summaries, and unquantified bullets',
      ],
      metricLabel: 'Dedicated /ats-checker Route',
      ctaText: 'Run ATS Resume Audit',
      href: '/ats-checker',
      icon: ShieldCheck,
      accentColor: '#18B89A',
      mockupType: 'ats-audit' as const,
    },
    {
      index: '03.',
      title: 'Target Job Matcher',
      kicker: 'Job Description Comparison & AI Advisor',
      description:
        'Paste any target job posting to compare requirements against your resume. View matched keywords, missing relevant terms, and contextual Gemini advice without fake ATS pass claims.',
      highlights: [
        'Highlights verified vs. missing role keywords side by side',
        'One-click "+ Add Skill" for missing competencies you genuinely own',
        'Provides deep-linked contextual suggestions per resume section',
      ],
      metricLabel: 'Dedicated /job-matcher Route',
      ctaText: 'Compare a Job Description',
      href: '/job-matcher',
      icon: Target,
      accentColor: '#18B89A',
      mockupType: 'job-match' as const,
    },
    {
      index: '04.',
      title: 'Designer A4 Templates',
      kicker: 'Adaptive Typography & 1:1 Vector PDF',
      description:
        'Switch seamlessly between Modern Accent, Executive Minimal, and Split Column layouts. Our adaptive spacing engine fills the A4 page naturally without large blank gaps.',
      highlights: [
        'Readable 10.5–12pt body copy and 22–26pt candidate headers',
        'Exports 100% selectable vector PDF matching the live preview 1:1',
        'Supports automatic multi-page pagination for extensive histories',
      ],
      metricLabel: 'Dedicated /templates Route',
      ctaText: 'Explore Template Studio',
      href: '/templates',
      icon: LayoutTemplate,
      accentColor: '#6D5CE8',
      mockupType: 'templates' as const,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className={`no-print relative overflow-hidden bg-gradient-to-b from-white via-[#F6F4FF] to-[#EDE9FE]/65 border-b border-slate-200/80 py-20 sm:py-28 ${
        !isInView ? 'features-offscreen' : ''
      }`}
    >
      {/* Subtle Architectural Dot Grid Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(109, 92, 232, 0.16) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glowing Ambient Violet & Teal Background Accents (GPU Transformed) */}
      <div
        aria-hidden="true"
        className="feature-orb-animate pointer-events-none absolute -top-28 -right-24 w-[420px] h-[420px] rounded-full bg-[#6D5CE8]/[0.10] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="feature-orb-animate-slow pointer-events-none absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#18B89A]/[0.10] blur-3xl"
      />

      {/* Lightweight Floating Particles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {AMBIENT_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="feature-particle absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: `0 0 12px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Staggered Entrance */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
              <Sparkles className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>Dedicated Startup Application Suite</span>
            </div>
            <h2
              id="features-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18181B] text-balance"
            >
              Four Specialized Tools, Each on Its Own Dedicated Workspace Page
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every tool is engineered for clarity, speed, and zero clutter—synchronized in real time with your active resume draft.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/resume-builder"
              className="group/cta clay-violet relative overflow-hidden min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#6D5CE8] hover:bg-[#5B4AD6] active:scale-[0.98] text-white text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>Build My Resume</span>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* 2x2 Interactive Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isViolet = feat.accentColor === '#6D5CE8';

            return (
              <InteractiveTiltCard
                key={feat.title}
                index={idx}
                accentColor={feat.accentColor}
                prefersReducedMotion={prefersReducedMotion}
              >
                <div className="space-y-5">
                  {/* Top Row: Animated Icon + Kicker & Route Link */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${
                          isViolet
                            ? 'bg-[#6D5CE8]/10 text-[#6D5CE8] border border-[#6D5CE8]/20'
                            : 'bg-[#18B89A]/12 text-[#18B89A] border border-[#18B89A]/25'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">
                          {feat.kicker}
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-[#18181B]">
                          <span
                            className={`font-mono text-sm mr-1.5 ${
                              isViolet ? 'text-[#6D5CE8]' : 'text-[#18B89A]'
                            }`}
                          >
                            {feat.index}
                          </span>
                          {feat.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href={feat.href}
                      className={`font-mono text-[11px] font-semibold px-2.5 py-1 rounded-xl hidden sm:inline-flex items-center transition-colors ${
                        isViolet
                          ? 'text-[#6D5CE8] bg-[#6D5CE8]/10 hover:bg-[#6D5CE8]/15'
                          : 'text-[#0F766E] bg-[#18B89A]/12 hover:bg-[#18B89A]/20'
                      }`}
                    >
                      {feat.href}
                    </Link>
                  </div>

                  {/* Interactive Animated Preview Stage */}
                  <div>
                    {feat.mockupType === 'ai-writer' && (
                      <LiveAiBuilderStage
                        isActive={isInView}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    )}
                    {feat.mockupType === 'ats-audit' && (
                      <LiveAtsCheckerStage
                        isActive={isInView}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    )}
                    {feat.mockupType === 'job-match' && (
                      <LiveJobMatcherStage
                        isActive={isInView}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    )}
                    {feat.mockupType === 'templates' && (
                      <LiveTemplateStage
                        isActive={isInView}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Concrete Mechanism Highlights */}
                  <ul className="space-y-2.5 pt-2 border-t border-slate-200/70">
                    {feat.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isViolet
                              ? 'bg-[#6D5CE8]/12 text-[#6D5CE8]'
                              : 'bg-[#18B89A]/15 text-[#18B89A]'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer & Polished Action Button */}
                <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200/70">
                  <span className="font-mono text-xs text-slate-500">
                    {feat.metricLabel}
                  </span>
                  <Link
                    href={feat.href}
                    className={`group/btn min-h-[42px] px-4 py-2 rounded-2xl text-xs font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap ml-auto ${
                      isViolet
                        ? 'clay-violet bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white'
                        : 'clay-teal bg-[#18B89A] hover:bg-[#149E83] text-white'
                    }`}
                  >
                    <span>{feat.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </InteractiveTiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
