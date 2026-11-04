'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Info, Sparkles } from 'lucide-react';

interface BrandItem {
  name: 'Google' | 'Microsoft' | 'Amazon' | 'Meta' | 'Apple';
  wordmarkClass: string;
  topStripClass: string;
  cardClass: string;
  glowHaloClass: string;
}

const BRANDS: BrandItem[] = [
  {
    name: 'Google',
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.03em] text-2xl sm:text-[26px]',
    topStripClass:
      'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]',
    cardClass:
      'border-[#4285F4]/40 bg-gradient-to-b from-[#4285F4]/[0.08] via-white to-[#34A853]/[0.06] hover:border-[#4285F4] shadow-[0_10px_28px_-6px_rgba(66,133,244,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(66,133,244,0.38)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#4285F4]/30 via-[#EA4335]/20 to-[#34A853]/30',
  },
  {
    name: 'Microsoft',
    wordmarkClass:
      'font-sans font-bold tracking-[-0.02em] text-2xl sm:text-[25px] text-[#0078D4]',
    topStripClass:
      'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF]',
    cardClass:
      'border-[#00A4EF]/40 bg-gradient-to-b from-[#00A4EF]/[0.08] via-white to-[#7FBA00]/[0.06] hover:border-[#00A4EF] shadow-[0_10px_28px_-6px_rgba(0,164,239,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(0,164,239,0.38)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#F25022]/25 via-[#7FBA00]/20 to-[#00A4EF]/30',
  },
  {
    name: 'Amazon',
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.03em] text-2xl sm:text-[26px] lowercase text-[#232F3E]',
    topStripClass:
      'bg-gradient-to-r from-[#FF9900] via-[#FFB84D] to-[#232F3E]',
    cardClass:
      'border-[#FF9900]/50 bg-gradient-to-b from-[#FF9900]/[0.10] via-white to-[#232F3E]/[0.05] hover:border-[#FF9900] shadow-[0_10px_28px_-6px_rgba(255,153,0,0.26)] hover:shadow-[0_16px_36px_-6px_rgba(255,153,0,0.40)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#FF9900]/35 via-[#FFB84D]/25 to-[#232F3E]/20',
  },
  {
    name: 'Meta',
    wordmarkClass:
      'font-display font-extrabold tracking-[-0.02em] text-2xl sm:text-[26px] text-[#0668E1]',
    topStripClass:
      'bg-gradient-to-r from-[#0081FB] via-[#0668E1] to-[#00C6FF]',
    cardClass:
      'border-[#0081FB]/40 bg-gradient-to-b from-[#0081FB]/[0.08] via-white to-[#0668E1]/[0.06] hover:border-[#0081FB] shadow-[0_10px_28px_-6px_rgba(0,129,251,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(0,129,251,0.38)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#0081FB]/30 via-[#0668E1]/25 to-[#00C6FF]/25',
  },
  {
    name: 'Apple',
    wordmarkClass:
      'font-display font-bold tracking-[-0.025em] text-2xl sm:text-[26px] text-[#1D1D1F]',
    topStripClass:
      'bg-gradient-to-r from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6]',
    cardClass:
      'border-[#0071E3]/40 bg-gradient-to-b from-[#0071E3]/[0.08] via-white to-[#1D1D1F]/[0.05] hover:border-[#0071E3] shadow-[0_10px_28px_-6px_rgba(0,113,227,0.24)] hover:shadow-[0_16px_36px_-6px_rgba(0,113,227,0.36)]',
    glowHaloClass:
      'bg-gradient-to-r from-[#1D1D1F]/20 via-[#0071E3]/30 to-[#5E5CE6]/25',
  },
];

// Duplicate into two identical halves (10 + 10 items) so -50% translation loops seamlessly on all viewports
const MARQUEE_TRACK = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];

export default function PopularEmployersSection() {
  return (
    <section
      aria-labelledby="popular-employers-heading"
      className="no-print relative overflow-hidden bg-white border-b border-slate-200 py-10 sm:py-14"
    >
      {/* Animated Startup Ambient Mesh Backdrop */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.45, 0.8, 0.45],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-[#4285F4]/[0.07] via-[#FF9900]/[0.07] to-[#0081FB]/[0.07] blur-2xl"
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

        {/* Smooth Infinite Scrolling Startup Brand Marquee */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Soft Left & Right Startup Edge Fade Masks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 sm:w-28 bg-gradient-to-r from-white via-white/85 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 sm:w-28 bg-gradient-to-l from-white via-white/85 to-transparent"
          />

          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex w-max items-center gap-4 sm:gap-6 px-2"
          >
            {MARQUEE_TRACK.map((brand, idx) => (
              <motion.div
                key={`${brand.name}-${idx}`}
                whileHover={{ y: -5, scale: 1.04 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 24,
                }}
                className={`group relative overflow-hidden min-w-[175px] sm:min-w-[205px] h-[74px] sm:h-[82px] px-6 rounded-2xl border flex items-center justify-center shrink-0 select-none ${brand.cardClass}`}
              >
                {/* Official Brand Color Top Strip */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 inset-x-0 h-1.5 ${brand.topStripClass}`}
                />

                {/* Pulsing Brand Glow Halo */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -inset-2 opacity-45 group-hover:opacity-85 transition-opacity blur-xl ${brand.glowHaloClass}`}
                />

                {/* Clean Official Colored Brand Logo & Wordmark Only */}
                <div className="relative z-10 flex items-center justify-center">
                  {brand.name === 'Google' && (
                    <span aria-label="Google" className={brand.wordmarkClass}>
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </span>
                  )}

                  {brand.name === 'Microsoft' && (
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid grid-cols-2 gap-[2px] w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0"
                      >
                        <span className="bg-[#F25022] rounded-[1px]" />
                        <span className="bg-[#7FBA00] rounded-[1px]" />
                        <span className="bg-[#00A4EF] rounded-[1px]" />
                        <span className="bg-[#FFB900] rounded-[1px]" />
                      </span>
                      <span className={brand.wordmarkClass}>Microsoft</span>
                    </span>
                  )}

                  {brand.name === 'Amazon' && (
                    <span className="inline-flex flex-col items-center leading-none">
                      <span className={brand.wordmarkClass}>amazon</span>
                      <span
                        aria-hidden="true"
                        className="w-14 h-1.5 border-b-[3px] border-[#FF9900] rounded-full -mt-0.5"
                      />
                    </span>
                  )}

                  {brand.name === 'Meta' && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="font-mono font-extrabold text-2xl sm:text-[26px] leading-none text-[#0081FB]"
                      >
                        ∞
                      </span>
                      <span className={brand.wordmarkClass}>Meta</span>
                    </span>
                  )}

                  {brand.name === 'Apple' && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#1D1D1F] via-[#0071E3] to-[#5E5CE6] shrink-0 shadow-sm"
                      />
                      <span className={brand.wordmarkClass}>Apple</span>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
