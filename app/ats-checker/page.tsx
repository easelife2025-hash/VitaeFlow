'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Target,
  FolderOpen,
  Wand2,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import {
  evaluateResumeDeterministically,
  SECTION_LABELS,
} from '@/lib/ats-deterministic';
import { EditorSectionId } from '@/lib/types';
import ResumePreview from '@/components/ResumePreview';

export default function AtsCheckerPage() {
  const router = useRouter();
  const {
    activeResume,
    drafts,
    setTargetEditorSection,
    openDraftsModal,
    openDefaultAiEnhancer,
    handleUpdateTemplate,
    handleUpdateAccent,
    handleExportPdf,
  } = useResume();

  const deterministic = useMemo(
    () =>
      evaluateResumeDeterministically(
        activeResume,
        activeResume.jobDescriptionDraft || ''
      ),
    [activeResume]
  );

  // Intrinsic ATS Resume Quality Score (Completeness + Formatting + Quantified Action Verbs)
  const actionVerbRatio =
    deterministic.totalBullets > 0
      ? Math.round(
          (deterministic.strongVerbBullets / deterministic.totalBullets) * 100
        )
      : 0;

  const intrinsicQualityScore = Math.min(
    99,
    Math.round(
      deterministic.completenessScore * 0.5 +
        deterministic.formattingScore * 0.35 +
        actionVerbRatio * 0.15
    )
  );

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(99, Math.max(0, intrinsicQualityScore)) / 100) * circumference;

  const handleJumpToSection = (sectionId: EditorSectionId) => {
    setTargetEditorSection(sectionId);
    router.push(`/resume-builder?section=${sectionId}`);
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Page Header Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#18B89A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Deterministic ATS Quality & Structure Auditor</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Auditing: {activeResume.title}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#18181B]">
              ATS Resume Checker & Section Completeness Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Evaluates your resume’s 8-section completeness, formatting rules, action-verb strength, and measurable impact metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openDraftsModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Switch Resume ({drafts.length})</span>
            </button>

            <Link
              href="/job-matcher"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Compare with a Job Description →</span>
            </Link>
          </div>
        </div>

        {/* Main Split Layout: Audit Report (Left) & Live A4 Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Score Card & Transparency Notice */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18181B]">
                    Measurable Deterministic Audit:
                  </strong>{' '}
                  This score reflects your resume’s structural completeness, parseable formatting, and quantified bullet density. No tool can guarantee an automated ATS pass.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Score Ring */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="#E2E8F0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke={
                        intrinsicQualityScore >= 80 ? '#18B89A' : '#6D5CE8'
                      }
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono tabular-nums text-xl font-bold text-[#18181B]">
                      {intrinsicQualityScore}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                      ATS Quality
                    </span>
                  </div>
                </div>

                {/* 4 Pillar Metrics */}
                <div className="flex-1 grid grid-cols-2 gap-2.5 w-full">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      8-Section Completeness
                    </span>
                    <span className="font-mono tabular-nums text-base font-bold text-[#18181B]">
                      {deterministic.completenessScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      Formatting & Rules
                    </span>
                    <span className="font-mono tabular-nums text-base font-bold text-[#6D5CE8]">
                      {deterministic.formattingScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      Quantified Bullets
                    </span>
                    <span className="font-mono tabular-nums text-base font-bold text-[#18B89A]">
                      {deterministic.quantifiedBullets}/
                      {deterministic.totalBullets}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] text-slate-500">
                      Strong Action Verbs
                    </span>
                    <span className="font-mono tabular-nums text-base font-bold text-[#18181B]">
                      {deterministic.strongVerbBullets}/
                      {deterministic.totalBullets}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Formatting & Parseability Warnings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>
                      Formatting & Content Warnings (
                      {deterministic.formattingWarnings.length})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Checks for missing contact info, passive phrasing, unquantified bullets, and date consistency.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openDefaultAiEnhancer}
                  className="px-3 py-1.5 rounded-xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 hover:bg-[#6D5CE8]/10 text-xs font-semibold text-[#6D5CE8] flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Polish Bullets with AI</span>
                </button>
              </div>

              {deterministic.formattingWarnings.length === 0 ? (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#18B89A]/10 text-xs font-medium text-[#18181B]">
                  <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0" />
                  <span>
                    Zero formatting warnings! Your contact header, dates, summary length, and action verbs pass all deterministic checks.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deterministic.formattingWarnings.map((warn) => (
                    <div
                      key={warn.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              warn.severity === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {warn.severity}
                          </span>
                          <span className="text-xs font-bold text-[#18181B]">
                            {warn.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {warn.detail}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleJumpToSection(warn.targetSection)}
                        className="min-h-[34px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Fix in {SECTION_LABELS[warn.targetSection]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Section Completeness Checklist (All 8 Sections) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#18B89A]" />
                    <span>Section Completeness Checklist (8 Sections)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any section below to open it directly in the Resume Builder.
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs font-bold text-[#18181B]">
                  {deterministic.completenessScore}/100 pts
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {deterministic.sectionChecks.map((check) => (
                  <div
                    key={check.sectionId}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            check.status === 'complete'
                              ? 'bg-[#18B89A]'
                              : check.status === 'partial'
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#18181B]">
                          {check.label}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-slate-400">
                          ({check.earnedPoints}/{check.maxPoints} pts)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{check.summary}</p>
                      {check.recommendation && (
                        <p className="text-[11px] text-[#6D5CE8] font-medium">
                          Tip: {check.recommendation}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJumpToSection(check.sectionId)}
                      className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Edit {check.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Synchronized A4 Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-20">
            <ResumePreview
              resume={activeResume}
              onUpdateTemplate={handleUpdateTemplate}
              onUpdateAccent={handleUpdateAccent}
              onExportPdf={() => handleExportPdf()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
