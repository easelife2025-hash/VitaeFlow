'use client';

import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Copy,
  Trash2,
  Edit3,
  Check,
  X,
  FileEdit,
  Download,
  Search,
  Clock,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { ResumeDraft } from '@/lib/types';
import { downloadResumePdf } from '@/lib/pdf-export';
import { evaluateResumeDeterministically } from '@/lib/ats-deterministic';

interface ResumeDashboardProps {
  drafts: ResumeDraft[];
  activeDraftId: string;
  onSelectAndEdit: (id: string) => void;
  onOpenAtsAudit?: (id: string) => void;
  onOpenJobMatcher?: (id: string) => void;
  onCreateBlankResume: (title?: string) => void;
  onOpenImportModal: () => void;
  onDuplicateDraft: (id: string) => void;
  onRenameDraft: (id: string, newTitle: string) => void;
  onDeleteDraft: (id: string) => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  'modern-violet': 'Modern Minimalist',
  'executive-minimal': 'Executive Corporate',
  'teal-split': 'Split Column',
  'creative-studio': 'Creative Studio',
  'professional-ats': 'Professional ATS',
  'elegant-editorial': 'Elegant Editorial',
};

export default function ResumeDashboard({
  drafts,
  activeDraftId,
  onSelectAndEdit,
  onOpenAtsAudit,
  onOpenJobMatcher,
  onCreateBlankResume,
  onOpenImportModal,
  onDuplicateDraft,
  onRenameDraft,
  onDeleteDraft,
}: ResumeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newTitlePrompt, setNewTitlePrompt] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredDrafts = drafts.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.personalInfo.fullName.toLowerCase().includes(q) ||
      d.personalInfo.jobTitle.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently updated';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Card: Create Resume & Import Resume */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-[#18181B]">
              Saved Resumes & Drafts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any resume to open in the Builder, audit in ATS Checker, match against a Job Description, or download as a 1:1 A4 PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Resume</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportModal}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200 hover:border-[#6D5CE8]/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#18B89A]" />
              <span>Import Resume</span>
            </button>
          </div>
        </div>

        {/* Inline Quick-Create Input */}
        {showCreateForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateBlankResume(
                newTitlePrompt.trim() || `New Resume ${drafts.length + 1}`
              );
              setNewTitlePrompt('');
              setShowCreateForm(false);
            }}
            className="flex flex-col sm:flex-row gap-2.5 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200"
          >
            <input
              type="text"
              value={newTitlePrompt}
              onChange={(e) => setNewTitlePrompt(e.target.value)}
              placeholder="Enter a title (e.g., Senior Frontend Engineer — Q4 Applications)..."
              autoFocus
              className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#18B89A] hover:bg-[#149E83] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                Create & Open Builder
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-[#18181B] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Search & Count Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600">
            All Saved Resumes (
            <span className="font-mono tabular-nums">{filteredDrafts.length}</span>
            )
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter resumes by title or role..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
            />
          </div>
        </div>

        {/* Recent Resumes List */}
        <div className="space-y-3">
          {filteredDrafts.map((draft) => {
            const isActive = draft.id === activeDraftId;
            const isRenaming = renamingId === draft.id;
            const det = evaluateResumeDeterministically(
              draft,
              draft.jobDescriptionDraft || ''
            );
            const score = draft.atsAnalysis?.score ?? det.estimatedQualityScore;

            return (
              <div
                key={draft.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                  isActive
                    ? 'border-[#6D5CE8] bg-[#6D5CE8]/[0.03]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  {isRenaming ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                        className="h-9 flex-1 max-w-xs rounded-lg border border-[#6D5CE8] px-3 text-sm text-[#18181B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (renameValue.trim()) {
                            onRenameDraft(draft.id, renameValue.trim());
                          }
                          setRenamingId(null);
                        }}
                        className="p-2 rounded-lg bg-[#18B89A] text-white hover:bg-[#149E83] cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#18181B] cursor-pointer"
                        title="Cancel rename"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectAndEdit(draft.id)}
                        className="font-display text-sm sm:text-base font-bold text-[#18181B] hover:text-[#6D5CE8] transition-colors text-left truncate cursor-pointer"
                      >
                        {draft.title}
                      </button>
                      {isActive && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#6D5CE8]/10 text-[#6D5CE8]">
                          Active Draft
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata Line */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {draft.personalInfo.fullName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{draft.personalInfo.jobTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{TEMPLATE_NAMES[draft.templateId] || 'Modern'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(draft.updatedAt)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold text-[#18B89A]">
                      Est. Quality {score}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectAndEdit(draft.id)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {onOpenAtsAudit && (
                    <button
                      type="button"
                      onClick={() => onOpenAtsAudit(draft.id)}
                      className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#18B89A] bg-white text-xs font-semibold text-slate-700 hover:text-[#18B89A] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Open in ATS Checker"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A]" />
                      <span>ATS Check</span>
                    </button>
                  )}

                  {onOpenJobMatcher && (
                    <button
                      type="button"
                      onClick={() => onOpenJobMatcher(draft.id)}
                      className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Compare against Job Description"
                    >
                      <Target className="w-3.5 h-3.5 text-[#6D5CE8]" />
                      <span>Job Match</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(draft.id);
                      setRenameValue(draft.title);
                    }}
                    title="Rename resume"
                    className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-700 hover:text-[#18181B] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rename</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateDraft(draft.id)}
                    title="Duplicate resume"
                    className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-700 hover:text-[#6D5CE8] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadResumePdf(draft)}
                    title="Download formatted PDF resume"
                    className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#18B89A] bg-white text-xs font-semibold text-slate-700 hover:text-[#18B89A] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#18B89A]" />
                    <span>PDF</span>
                  </button>

                  {drafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteDraft(draft.id)}
                      title="Delete resume"
                      className="min-h-[36px] p-2 rounded-xl border border-slate-200 hover:border-red-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
