'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  Settings,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeDashboard from '@/components/ResumeDashboard';
import ResumePreview from '@/components/ResumePreview';
import { evaluateResumeDeterministically } from '@/lib/ats-deterministic';

export default function DashboardPage() {
  const router = useRouter();
  const {
    drafts,
    activeResume,
    setActiveDraftId,
    handleCreateBlankDraft,
    openImportModal,
    handleDuplicateDraft,
    handleRenameDraft,
    handleDeleteDraft,
    handleUpdateTemplate,
    handleUpdateAccent,
    handleUpdateCustomColors,
    handleUpdateFontFamily,
    handleUpdateDecorativeHeading,
    handleExportPdf,
    aiUsage,
  } = useResume();

  const avgQuality = useMemo(() => {
    if (drafts.length === 0) return 0;
    const sum = drafts.reduce((acc, d) => {
      const det = evaluateResumeDeterministically(d, d.jobDescriptionDraft || '');
      return acc + (d.atsAnalysis?.score ?? det.estimatedQualityScore);
    }, 0);
    return Math.round(sum / drafts.length);
  }, [drafts]);

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] pt-5 pb-24 sm:py-8 lg:pb-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-5 sm:space-y-6">
        {/* Page Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#6D5CE8] flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Resume Command Center</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#18B89A] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-saved
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
              Dashboard & Saved Resumes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage all your tailored resume versions, launch the AI Resume Builder, run ATS checks, or download print-ready A4 PDFs.
            </p>
          </div>

          {/* Overview Telemetry Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <span className="block text-[10px] sm:text-[11px] text-slate-500 truncate">
                Resumes
              </span>
              <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-[#18181B]">
                {drafts.length}
              </span>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <span className="block text-[10px] sm:text-[11px] text-slate-500 truncate">
                ATS Quality
              </span>
              <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-[#18B89A]">
                {avgQuality}%
              </span>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <span className="block text-[10px] sm:text-[11px] text-slate-500 truncate">
                AI Quota
              </span>
              <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-[#6D5CE8]">
                {aiUsage.remaining}/{aiUsage.limit}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Route Launcher Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <Link
            href="/resume-builder"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#6D5CE8] shadow-2xs transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-[#18181B] group-hover:text-[#6D5CE8] block">
                Resume Builder
              </span>
              <span className="text-[11px] text-slate-500">
                Edit 8 sections + AI
              </span>
            </div>
            <FileEdit className="w-4 h-4 text-[#6D5CE8]" />
          </Link>

          <Link
            href="/ats-checker"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#18B89A] shadow-2xs transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-[#18181B] group-hover:text-[#18B89A] block">
                ATS Checker
              </span>
              <span className="text-[11px] text-slate-500">
                Completeness & rules
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#18B89A]" />
          </Link>

          <Link
            href="/job-matcher"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#6D5CE8] shadow-2xs transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-[#18181B] group-hover:text-[#6D5CE8] block">
                Job Matcher
              </span>
              <span className="text-[11px] text-slate-500">
                Compare with JD
              </span>
            </div>
            <Target className="w-4 h-4 text-[#6D5CE8]" />
          </Link>

          <Link
            href="/templates"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#18B89A] shadow-2xs transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-[#18181B] group-hover:text-[#18B89A] block">
                Templates
              </span>
              <span className="text-[11px] text-slate-500">
                6 Designer A4 layouts
              </span>
            </div>
            <LayoutTemplate className="w-4 h-4 text-[#18B89A]" />
          </Link>

          <Link
            href="/settings"
            className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#6D5CE8] shadow-2xs transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-[#18181B] group-hover:text-[#6D5CE8] block">
                Settings
              </span>
              <span className="text-[11px] text-slate-500">
                AI limits & backups
              </span>
            </div>
            <Settings className="w-4 h-4 text-slate-500 group-hover:text-[#6D5CE8]" />
          </Link>
        </div>

        {/* Main Split Grid: Saved Resumes List (Left) & Active Resume Live A4 Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <ResumeDashboard
              drafts={drafts}
              activeDraftId={activeResume.id}
              onSelectAndEdit={(id) => {
                setActiveDraftId(id);
                router.push('/resume-builder');
              }}
              onOpenAtsAudit={(id) => {
                setActiveDraftId(id);
                router.push('/ats-checker');
              }}
              onOpenJobMatcher={(id) => {
                setActiveDraftId(id);
                router.push('/job-matcher');
              }}
              onCreateBlankResume={(title) => {
                handleCreateBlankDraft(title);
                router.push('/resume-builder');
              }}
              onOpenImportModal={openImportModal}
              onDuplicateDraft={handleDuplicateDraft}
              onRenameDraft={handleRenameDraft}
              onDeleteDraft={handleDeleteDraft}
            />
          </div>

          <div className="lg:col-span-6 lg:sticky lg:top-20">
            <ResumePreview
              resume={activeResume}
              onUpdateTemplate={handleUpdateTemplate}
              onUpdateAccent={handleUpdateAccent}
              onUpdateCustomColors={handleUpdateCustomColors}
              onUpdateFontFamily={handleUpdateFontFamily}
              onUpdateDecorativeHeading={handleUpdateDecorativeHeading}
              onExportPdf={() => handleExportPdf()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
