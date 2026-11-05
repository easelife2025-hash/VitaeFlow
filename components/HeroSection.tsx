'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  Wand2,
  Target,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

const INTERVIEW_SCENES = [
  {
    src: '/images/hero-interview-poster.jpg',
    caption: 'Panel Interview · Product & Engineering Leadership',
    role: 'Senior Frontend Candidate',
  },
  {
    src: '/images/hero-interview-scene2.jpg',
    caption: 'Portfolio Walkthrough · Architecture & Impact Review',
    role: 'Staff Product Designer',
  },
  {
    src: '/images/hero-interview-scene3.jpg',
    caption: 'Final Round Offer · Executive Hiring Team',
    role: 'Lead Software Engineer',
  },
];


export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [useFallbackStage, setUseFallbackStage] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % INTERVIEW_SCENES.length);
    }, 3400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    const videoEl = videoRef.current;
    if (!videoEl || useFallbackStage) {
      setIsPlaying((prev) => !prev);
      return;
    }
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="no-print">
      {/* STARTUP HERO SECTION WITH LOOPING INTERVIEW VIDEO & FLOATING TELEMETRY CARDS */}
      <section
        aria-label="Hero introduction"
        className="relative w-full min-h-[430px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end overflow-hidden bg-[#090A0F] text-white"
      >
        {/* Full-Width Edge-to-Edge Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {!useFallbackStage ? (
            <video
              ref={videoRef}
              src="/videos/hero-interview.mp4"
              poster="/images/hero-interview-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setUseFallbackStage(true)}
              aria-label="Looping background video of confident candidates attending interviews in a modern office"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <Image
              src={INTERVIEW_SCENES[activeSceneIndex].src}
              alt={INTERVIEW_SCENES[activeSceneIndex].caption}
              fill
              referrerPolicy="no-referrer"
              className="object-cover object-center transition-opacity duration-700"
            />
          )}

          {/* Multi-Layer Gradient Overlay for Crisp Readability */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#07080D] via-[#07080D]/65 to-[#07080D]/35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#07080D]/90 via-[#07080D]/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-[#6D5CE8]/25 blur-3xl pointer-events-none"
          />
        </div>

        {/* Floating UI Cards Over the Right Area of the Video */}
        <div className="hidden lg:flex flex-col gap-3 absolute right-6 xl:right-12 top-1/2 -translate-y-1/2 z-10 max-w-[260px]">
          {/* Floating Card 1: 96% ATS Quality Card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
            transition={{
              opacity: { duration: 0.45, delay: 0.15 },
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Link
              href="/ats-checker"
              className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 hover:scale-[1.02] transition-transform"
            >
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="15.5"
                    stroke="#E2E8F0"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="15.5"
                    stroke="#18B89A"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 15.5}
                    strokeDashoffset={2 * Math.PI * 15.5 * (1 - 0.96)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute font-mono tabular-nums text-[10px] font-bold text-[#18181B]">
                  96%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#18181B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A]" />
                  <span>ATS Quality Audit</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  8/8 Sections · 14 Keywords
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Floating Card 2: AI Action-Verb Resume Bullet Card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, y: [0, 4, 0] }}
            transition={{
              opacity: { duration: 0.45, delay: 0.25 },
              y: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Link
              href="/resume-builder"
              className="block bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-xl hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#6D5CE8] flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  <span>Fact-Safe AI Rewrite</span>
                </span>
                <span className="font-mono tabular-nums text-[10px] font-semibold text-[#18B89A]">
                  Verified Facts
                </span>
              </div>
              <p className="text-[11.5px] text-[#18181B] leading-snug">
                <strong className="text-[#6D5CE8]">Spearheaded</strong> Next.js
                migration, cutting checkout latency by{' '}
                <strong className="font-mono tabular-nums text-[#18B89A]">
                  38%
                </strong>
                .
              </p>
            </Link>
          </motion.div>

          {/* Floating Card 3: 1:1 Vector A4 PDF Ready */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            <Link
              href="/templates"
              className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center justify-between gap-2 hover:scale-[1.02] transition-transform"
            >
              <span className="text-[11px] font-bold text-[#18181B] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#6D5CE8]" />
                <span>3 Designer A4 Templates</span>
              </span>
              <span className="text-[10px] font-semibold text-[#18B89A]">
                1:1 PDF →
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Hero Copy & CTAs */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-[#18B89A]">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>STARTUP-GRADE AI RESUME STUDIO & ATS AUDITOR</span>
            </div>

            <h1
              className="font-display font-extrabold uppercase tracking-tight text-white leading-[1.06] text-balance"
              style={{ fontSize: 'clamp(1.85rem, 3.6vw, 3.1rem)' }}
            >
              LAND YOUR DREAM INTERVIEW WITH A{' '}
              <span className="text-[#6D5CE8]">DESIGNER-GRADE</span> RESUME
            </h1>


            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/resume-builder"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#6D5CE8]/30 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-4 h-4 shrink-0" />
                <span>Build My Resume</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <Link
                href="/ats-checker"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/25 backdrop-blur-md font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0" />
                <span>Free ATS Resume Check</span>
              </Link>

              <Link
                href="/job-matcher"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Target className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                <span>Match a Job Description</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                <span>Preserves 100% of Your Facts</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
                <span>Deterministic + Gemini ATS Checks</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                <span>Instant 1:1 A4 Vector PDF</span>
              </span>
            </div>
          </motion.div>

          {/* Bottom Bar: Scene Indicator Bars (Left) & Video Pause/Play Toggle (Right) */}
          <div className="mt-6 pt-3.5 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label="Video scene indicator">
              {INTERVIEW_SCENES.map((scene, idx) => (
                <button
                  key={scene.role}
                  type="button"
                  onClick={() => setActiveSceneIndex(idx)}
                  aria-label={`Scene ${idx + 1}: ${scene.role}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSceneIndex === idx
                      ? 'w-6 bg-[#6D5CE8]'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
              <span className="hidden sm:inline-block ml-1.5 text-xs text-slate-300">
                {INTERVIEW_SCENES[activeSceneIndex].role} ·{' '}
                {INTERVIEW_SCENES[activeSceneIndex].caption}
              </span>
            </div>

            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={
                isPlaying ? 'Pause background video' : 'Play background video'
              }
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 fill-white" />
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
