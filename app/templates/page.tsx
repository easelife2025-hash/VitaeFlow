'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutTemplate,
  FileEdit,
  FolderOpen,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import TemplateSelector from '@/components/TemplateSelector';
import ResumePreview from '@/components/ResumePreview';
import { SAMPLE_RESUMES } from '@/lib/sample-data';

export default function TemplatesPage() {
  const {
    activeResume,
    drafts,
    handleUpdateActiveResume,
    handleUpdateTemplate,
    handleUpdateAccent,
    handleUpdateCustomColors,
    handleUpdateFontFamily,
    handleUpdateDecorativeHeading,
    handleSelectExampleResume,
    handleExportPdf,
    openDraftsModal,
  } = useResume();

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] pt-5 pb-24 sm:py-8 lg:pb-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-5 sm:space-y-6">
        {/* Page Header Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#6D5CE8] flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4" />
                <span>A4 Template & Typography Studio</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Active Resume: {activeResume.title}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#18181B]">
              Six Switchable Designer A4 Resume Templates
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Compare Modern, Executive, Split Column, Creative, Professional, and Elegant layouts with custom color palettes and Google Fonts.
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
              href="/resume-builder"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-[#18181B] flex items-center gap-1.5"
            >
              <FileEdit className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Edit Content</span>
            </Link>

            <button
              type="button"
              onClick={() => handleExportPdf()}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download 1:1 PDF</span>
            </button>
          </div>
        </div>

        {/* Main Split Layout: Template Controls (Left) & Live A4 Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-5">
            <TemplateSelector
              resume={activeResume}
              onChangeResume={handleUpdateActiveResume}
            />

            {/* Sample Persona Switcher Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h2 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#18B89A]" />
                  <span>Preview With Sample Industry Resumes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Load a pre-built sample resume to inspect how different role histories flow across each template.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_RESUMES.map((sample) => {
                  const isCurrent = activeResume.id === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectExampleResume(sample)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#6D5CE8] bg-[#6D5CE8]/5 ring-1 ring-[#6D5CE8]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#18181B] truncate">
                        {sample.personalInfo.fullName}
                      </span>
                      <span className="block text-[11px] text-[#6D5CE8] font-medium mt-0.5 truncate">
                        {sample.personalInfo.jobTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
