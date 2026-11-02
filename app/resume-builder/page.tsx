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
    <main className="flex-1 bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#6D5CE8] flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5" />
                <span>AI Resume Builder Studio</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#18B89A] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-saved to browser
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-600">
                {aiUsage.activeModelLabel || 'Gemini 3.8 Flash'} ({aiUsage.used}/{aiUsage.limit} · Auto-Switch On)
              </span>
            </div>
            <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-[#18181B]">
              {activeResume.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openDraftsModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Switch Draft ({drafts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateBlankDraft()}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>New Resume</span>
            </button>

            <button
              type="button"
              onClick={openImportModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#18B89A] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>Import Resume</span>
            </button>

            <button
              type="button"
              onClick={openFullResumePolishModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Polish Whole Resume</span>
            </button>

            <button
              type="button"
              onClick={openDefaultAiEnhancer}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 hover:bg-[#6D5CE8]/10 text-xs font-semibold text-[#6D5CE8] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Bullet Rewriter</span>
            </button>

            <Link
              href="/ats-checker"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#18B89A] text-xs font-semibold text-slate-700 hover:text-[#18B89A] flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>ATS Check</span>
            </Link>

            <Link
              href="/job-matcher"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] flex items-center gap-1.5 whitespace-nowrap"
            >
              <Target className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Job Matcher</span>
            </Link>
          </div>
        </div>

        {/* Mobile View Switcher (Editor vs Live A4 Preview) */}
        <div className="lg:hidden grid grid-cols-2 gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`min-h-[40px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileView === 'editor'
                ? 'bg-[#6D5CE8] text-white'
                : 'text-slate-600'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Edit Sections</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`min-h-[40px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-[#6D5CE8] text-white'
                : 'text-slate-600'
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
