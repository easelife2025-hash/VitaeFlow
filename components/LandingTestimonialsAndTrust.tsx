'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  Award,
  Layers,
} from 'lucide-react';

const SAMPLE_STORIES = [
  {
    personaBadge: 'Sample Candidate Workflow · Senior Frontend Engineer',
    name: 'Alex M. (Illustrative Persona)',
    targetTransition: 'Legacy Single-Column Doc → Modern Accent A4 Template',
    highlightMetric: '68% → 95% Est. ATS Quality',
    quote:
      'Demonstrates how a mid-career frontend engineer uses the AI Action-Verb Rewriter to turn passive sprint notes into quantified achievement statements and align keywords for cloud engineering roles.',
    tags: ['AI Bullet Rewriter', 'Modern Accent Template', '1-Page A4 Fit'],
  },
  {
    personaBadge: 'Sample Candidate Workflow · Product & Operations Lead',
    name: 'Priya S. (Illustrative Persona)',
    targetTransition: 'Unstructured CV → Executive Minimal Template',
    highlightMetric: '8/8 Sections Audited',
    quote:
      'Illustrates how leadership candidates use the deterministic 8-Section Completeness Checklist to resolve missing header links, standardize date formats, and export a board-ready Executive Minimal PDF.',
    tags: ['Executive Minimal', 'ATS Completeness Check', 'Fact-Safe Summary'],
  },
  {
    personaBadge: 'Sample Candidate Workflow · Full-Stack Developer',
    name: 'Mateo R. (Illustrative Persona)',
    targetTransition: '2-Page Overflow → Technical Split Column Template',
    highlightMetric: '14 Target Skills Matched',
    quote:
      'Shows how technical candidates compare their resume side-by-side with a pasted Job Description in the Job Matcher and organize skills cleanly inside the Split Column layout.',
    tags: ['Split Column Layout', 'Job Description Matcher', 'Vector PDF'],
  },
];

const TRUST_PILLARS = [
  {
    icon: Lock,
    title: 'Server-Side Gemini API Security',
    description:
      'All AI requests run exclusively through protected Next.js server endpoints (`/api/ai/*`) with configurable hourly rate limits. Your API keys are never exposed in browser code.',
    accent: '#6D5CE8',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Fact-Preservation Guardrail',
    description:
      'VitaeFlow never invents employers, degrees, certifications, or fake metrics. Every AI suggestion is grounded strictly in your provided experience and shown for review before applying.',
    accent: '#18B89A',
  },
  {
    icon: FileCheck2,
    title: '1:1 Selectable Vector A4 PDF Engine',
    description:
      'What you see in the live A4 preview is what you download. Our adaptive typography engine distributes content naturally across the page and exports 100% ATS-parseable text.',
    accent: '#6D5CE8',
  },
  {
    icon: Layers,
    title: 'Local-First Privacy & Full JSON Portability',
    description:
      'Your resume drafts auto-save directly in your browser storage. Export full JSON backups or clear your local storage anytime from the dedicated Settings page.',
    accent: '#18B89A',
  },
];

export default function LandingTestimonialsAndTrust() {
  return (
    <div id="about-trust" className="no-print">
      {/* 1. CLEARLY LABELLED SAMPLE CANDIDATE STORIES / WORKFLOWS */}
      <section
        aria-labelledby="sample-stories-heading"
        className="bg-[#6D5CE8] border-b border-[#5B4AD6] py-16 sm:py-24"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/15 text-white text-xs font-bold border border-white/25">
                <Info className="w-3.5 h-3.5 text-[#18B89A]" />
                <span>Clearly Labelled Sample Candidate Workflows</span>
              </div>
              <h2
                id="sample-stories-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance"
              >
                How Candidates Use VitaeFlow Across Career Stages
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                The scenarios below are clearly labelled illustrative candidate workflows showing how each tool in VitaeFlow solves real resume bottlenecks.
              </p>
            </div>

            <Link
              href="/resume-builder"
              className="clay-teal min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#18B89A] hover:bg-[#149E83] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap self-start lg:self-auto"
            >
              <span>Start Your Own Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SAMPLE_STORIES.map((story, idx) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="clay-teal rounded-3xl border border-white/30 bg-[#18B89A] p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all text-white"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/20 text-white border border-white/30">
                      Sample Workflow
                    </span>
                    <span className="font-mono text-xs font-bold text-white bg-black/15 px-2.5 py-1 rounded-lg">
                      {story.highlightMetric}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      {story.name}
                    </h3>
                    <p className="text-xs font-semibold text-white/90 mt-0.5">
                      {story.targetTransition}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                    {story.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/20 flex flex-wrap gap-1.5">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-white/20 border border-white/30 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES, PRIVACY/SECURITY ARCHITECTURE & ABOUT US */}
      <section
        aria-labelledby="trust-security-heading"
        className="bg-[#F8FAFC] border-b border-slate-200 py-16 sm:py-24"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* About Us & Product Philosophy (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
                <Award className="w-4 h-4 text-[#18B89A]" />
                <span>About VitaeFlow</span>
              </div>
              <h2
                id="trust-security-heading"
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B] text-balance"
              >
                Built for Honest, High-Signal Technical & Executive Hiring
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Most resume builders either force your career into cramped, generic HTML forms or use AI that fabricates buzzwords and unverified metrics.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We built VitaeFlow around three non-negotiable principles:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Your facts stay yours:</strong> Gemini polishes phrasing and action verbs without ever inventing qualifications.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D5CE8] shrink-0 mt-0.5" />
                  <span>
                    <strong>Transparent ATS auditing:</strong> Measurable code checks combined with contextual AI advice—never fake &ldquo;guaranteed pass&rdquo; claims.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Designer-grade A4 typography:</strong> Readable 10.5–12pt body copy, 22–26pt headers, and adaptive vertical spacing.
                  </span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#18181B] hover:bg-slate-800 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/settings"
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] transition-all inline-flex items-center gap-1.5"
                >
                  <span>Privacy & Quota Settings</span>
                </Link>
              </div>
            </div>

            {/* 4 Trust & Security Cards (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TRUST_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="clay-violet bg-[#6D5CE8] border border-white/30 rounded-2xl p-6 space-y-3 text-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-white flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-base font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
