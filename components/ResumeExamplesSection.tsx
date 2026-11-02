'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Download,
} from 'lucide-react';
import { ResumeDraft, AccentColor } from '@/lib/types';
import { SAMPLE_RESUMES } from '@/lib/sample-data';
import { useResume } from '@/context/ResumeContext';
import { downloadResumePdf } from '@/lib/pdf-export';

const TEMPLATE_LABELS: Record<string, string> = {
  'modern-violet': 'Modern Accent Header',
  'teal-split': 'Technical Split Column',
  'executive-minimal': 'Executive Minimal',
};

const ACCENT_SWATCHES: { color: AccentColor; label: string }[] = [
  { color: '#6D5CE8', label: 'Violet' },
  { color: '#18B89A', label: 'Teal' },
  { color: '#18181B', label: 'Charcoal' },
];

export default function ResumeExamplesSection() {
  const router = useRouter();
  const { activeResume, handleSelectExampleResume } = useResume();
  const [previewAccent, setPreviewAccent] = useState<AccentColor | null>(null);

  const handleUseExample = (example: ResumeDraft) => {
    const customized: ResumeDraft = previewAccent
      ? { ...example, accentColor: previewAccent }
      : example;
    handleSelectExampleResume(customized);
    router.push('/resume-builder');
  };

  return (
    <section
      id="resume-examples"
      aria-labelledby="resume-examples-heading"
      className="no-print bg-white border-b border-slate-200 py-16 sm:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Designer A4 Resume Template Collage</span>
            </div>
            <h2
              id="resume-examples-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18181B] text-balance"
            >
              Executive Typography & Balanced Full-Page A4 Layouts
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every template features 22–26pt candidate names, 10.5–12pt body copy, right-aligned tabular dates, and adaptive spacing. Preview accent colors below or open any example in the Resume Builder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {/* Interactive Accent Color Previewer */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Accent:
              </span>
              {ACCENT_SWATCHES.map((sw) => (
                <button
                  key={sw.color}
                  type="button"
                  onClick={() => setPreviewAccent(sw.color)}
                  title={`Preview ${sw.label} accent`}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    previewAccent === sw.color
                      ? 'scale-115 ring-2 ring-offset-2 ring-[#6D5CE8]'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: sw.color }}
                />
              ))}
            </div>

            <Link
              href="/templates"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#6D5CE8]/15 transition-all inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Open Template Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3 Resume Template Collage Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SAMPLE_RESUMES.map((example, idx) => {
            const isLoaded = activeResume.id === example.id;
            const firstExp = example.experience[0];
            const score = example.atsAnalysis?.score ?? 94;
            const effectiveAccent = previewAccent || example.accentColor;

            return (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between space-y-5 ${
                  isLoaded
                    ? 'bg-[#6D5CE8]/[0.03] border-[#6D5CE8] ring-2 ring-[#6D5CE8]/15'
                    : 'bg-[#F8FAFC]/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Metadata Header */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#6D5CE8]">
                      {TEMPLATE_LABELS[example.templateId] || 'Modern Template'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#18B89A] bg-[#18B89A]/10 px-2.5 py-0.5 rounded-md">
                      ATS {score}%
                    </span>
                  </div>

                  {/* Mini Visual A4 Paper Preview */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {/* Top Accent Strip */}
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: effectiveAccent }}
                    />
                    <div className="p-4 sm:p-5 space-y-3.5">
                      <div
                        className={`pb-3 border-b ${
                          example.templateId === 'executive-minimal'
                            ? 'text-center'
                            : ''
                        }`}
                        style={{ borderColor: `${effectiveAccent}40` }}
                      >
                        <div className="font-display text-base font-extrabold text-[#18181B]">
                          {example.personalInfo.fullName}
                        </div>
                        <div
                          className="text-xs font-bold mt-0.5"
                          style={{ color: effectiveAccent }}
                        >
                          {example.personalInfo.jobTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 truncate">
                          {example.personalInfo.location} ·{' '}
                          {example.personalInfo.email}
                        </div>
                      </div>

                      {/* Mini Experience Snippet */}
                      {firstExp && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-1 h-3 rounded-full"
                              style={{ backgroundColor: effectiveAccent }}
                            />
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: effectiveAccent }}
                            >
                              Work Experience
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-1 text-xs">
                            <span className="font-bold text-[#18181B] truncate">
                              {firstExp.role} · {firstExp.company}
                            </span>
                            <span className="font-mono tabular-nums text-[10px] text-slate-400 shrink-0">
                              {firstExp.startDate}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-2">
                            • {firstExp.bullets[0]}
                          </p>
                        </div>
                      )}

                      {/* Mini 3-Col Skills Grid Preview */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600">
                          {example.skills.slice(0, 6).map((sk) => (
                            <span
                              key={sk}
                              className="truncate flex items-center gap-1"
                            >
                              <span
                                className="w-1 h-1 rounded-full shrink-0"
                                style={{ backgroundColor: effectiveAccent }}
                              />
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadResumePdf(
                        previewAccent
                          ? { ...example, accentColor: previewAccent }
                          : example
                      )
                    }
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#18B89A] bg-white text-xs font-semibold text-slate-700 hover:text-[#18B89A] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#18B89A]" />
                    <span>Sample PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseExample(example)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isLoaded
                        ? 'bg-[#18B89A] text-white hover:bg-[#149E83]'
                        : 'bg-[#6D5CE8] text-white hover:bg-[#5B4AD6]'
                    }`}
                  >
                    {isLoaded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Edit in Builder</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Use This Template</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
