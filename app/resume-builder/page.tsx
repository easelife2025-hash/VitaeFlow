'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileEdit,
  Wand2,
  Upload,
  Plus,
  ShieldCheck,
  Target,
  Eye,
  CheckCircle2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import ResumeEditor from '@/components/ResumeEditor';
import ResumePreview from '@/components/ResumePreview';
import { EditorSectionId } from '@/lib/types';

const VALID_SECTIONS: EditorSectionId[] = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const {
    activeResume,
    drafts,
    targetEditorSection,
    setTargetEditorSection,
    handleUpdateActiveResume,
    handleUpdateTemplate,
    handleUpdateAccent,
    handleUpdateCustomColors,
    handleUpdateFontFamily,
    handleUpdateDecorativeHeading,
    handleCreateBlankDraft,
    handleExportPdf,
    aiUsage,
    customAiLimit,
    setAiUsage,
    handleChangeCustomAiLimit,
    handleResetAiQuota,
    openDefaultAiEnhancer,
    openAiEnhancer,
    openFullResumePolishModal,
    openImportModal,
    openDraftsModal,
  } = useResume();

  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isGeneratedNotice, setIsGeneratedNotice] = useState(false);

  useEffect(() => {
    const secParam = searchParams.get('section') as EditorSectionId | null;
    if (secParam && VALID_SECTIONS.includes(secParam)) {
      setTargetEditorSection(secParam);
    }
  }, [searchParams, setTargetEditorSection]);

  const handleGenerateResume = () => {
    setMobileView('preview');
    setIsGeneratedNotice(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] pt-4 pb-24 sm:py-8 lg:pb-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-4 sm:space-y-6">
        {isGeneratedNotice && (
          <div className="bg-[#6D5CE8] text-white rounded-2xl p-4 sm:px-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#18B89A] shrink-0" />
              <div>
                <p className="font-display text-sm sm:text-base font-bold text-white">
                  Your A4 Resume Has Been Generated & Auto-Saved!
                </p>
                <p className="text-xs text-white/85">
                  Review your live A4 preview below, switch between the 6 designer templates, or download your 1:1 vector PDF.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExportPdf()}
                className="min-h-[38px] px-4 py-2 rounded-xl bg-[#18B89A] hover:bg-[#149E83] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Download A4 PDF
              </button>
              <button
                type="button"
                onClick={() => setIsGeneratedNotice(false)}
                className="min-h-[38px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Studio Header Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#6D5CE8] flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5" />
                <span>AI Resume Builder Studio</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#18B89A] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-saved
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="hidden sm:inline font-mono tabular-nums text-slate-600">
                {aiUsage.activeModelLabel || 'Gemini 3.8 Flash'} ({aiUsage.used}/{aiUsage.limit} · Auto-Switch On)
              </span>
            </div>
            <h1 className="font-display text-base sm:text-2xl font-bold tracking-tight text-[#18181B] truncate">
              {activeResume.title}
            </h1>
          </div>

          {/* Action Toolbar — Horizontal Swipe on Mobile, Wrap on Desktop */}
          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1">
            <button
              type="button"
              onClick={openFullResumePolishModal}
              className="min-h-[38px] sm:min-h-[40px] px-3.5 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Polish Resume</span>
            </button>

            <button
              type="button"
              onClick={openDefaultAiEnhancer}
              className="min-h-[38px] sm:min-h-[40px] px-3.5 py-2 rounded-xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 hover:bg-[#6D5CE8]/10 text-xs font-semibold text-[#6D5CE8] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Bullet Rewriter</span>
            </button>

            <button
              type="button"
              onClick={openDraftsModal}
              className="min-h-[38px] sm:min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Switch ({drafts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateBlankDraft()}
              className="min-h-[38px] sm:min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={openImportModal}
              className="min-h-[38px] sm:min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#18B89A] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>Import</span>
            </button>

            <Link
              href="/ats-checker"
              className="min-h-[38px] sm:min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#18B89A] text-xs font-semibold text-slate-700 hover:text-[#18B89A] flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>ATS Check</span>
            </Link>

            <Link
              href="/job-matcher"
              className="min-h-[38px] sm:min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Target className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Job Matcher</span>
            </Link>
          </div>
        </div>

        {/* Sticky Mobile View Switcher (Editor vs Live A4 Preview) */}
        <div className="lg:hidden sticky top-[68px] z-30 grid grid-cols-2 gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === 'editor'
                ? 'bg-[#6D5CE8] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#18181B]'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Edit Sections</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`min-h-[42px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-[#6D5CE8] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#18181B]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live A4 Preview</span>
          </button>
        </div>

        {/* Split Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Structured 8-Section Resume Editor */}
          <div
            className={`lg:col-span-6 ${
              mobileView === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <ResumeEditor
              resume={activeResume}
              onChange={handleUpdateActiveResume}
              externalSection={targetEditorSection}
              aiUsage={aiUsage}
              customAiLimit={customAiLimit}
              onChangeCustomAiLimit={handleChangeCustomAiLimit}
              onUpdateAiUsage={(u) => setAiUsage(u)}
              onResetAiQuota={handleResetAiQuota}
              onOpenAiEnhancer={(cfg) => openAiEnhancer(cfg)}
              onOpenFullResumePolish={openFullResumePolishModal}
              onGenerateResume={handleGenerateResume}
            />
          </div>

          {/* Right Column: Live Synchronized 1:1 A4 Resume Preview */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-20 ${
              mobileView === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
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

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-[#F8FAFC] p-8 text-center text-sm text-slate-500">
          Loading AI Resume Builder Studio...
        </div>
      }
    >
      <ResumeBuilderContent />
    </Suspense>
  );
}
