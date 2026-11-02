'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  X,
  Check,
  Download,
} from 'lucide-react';
import { ResumeDraft } from '@/lib/types';
import { downloadResumePdf } from '@/lib/pdf-export';

interface DraftsModalProps {
  isOpen: boolean;
  drafts: ResumeDraft[];
  activeDraftId: string;
  onSelectDraft: (id: string) => void;
  onCreateBlankDraft: (title: string) => void;
  onDuplicateDraft: (id: string) => void;
  onRenameDraft: (id: string, newTitle: string) => void;
  onDeleteDraft: (id: string) => void;
  onClose: () => void;
}

export default function DraftsModal({
  isOpen,
  drafts,
  activeDraftId,
  onSelectDraft,
  onCreateBlankDraft,
  onDuplicateDraft,
  onRenameDraft,
  onDeleteDraft,
  onClose,
}: DraftsModalProps) {
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newDraftTitle.trim() || `Resume Draft ${drafts.length + 1}`;
    onCreateBlankDraft(title);
    setNewDraftTitle('');
  };

  const handleExportJson = (draft: ResumeDraft) => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drafts-modal-title"
    >
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2
              id="drafts-modal-title"
              className="font-display text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-[#6D5CE8]" />
              <span>Saved Resume Drafts ({drafts.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Stored automatically in your browser. Create tailored versions for different roles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-[#18181B] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Create New Draft Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newDraftTitle}
              onChange={(e) => setNewDraftTitle(e.target.value)}
              placeholder="New draft name (e.g., Stripe Frontend Application)..."
              className="flex-1 h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Draft</span>
            </button>
          </form>

          {/* Draft List */}
          <div className="space-y-2.5">
            {drafts.map((draft) => {
              const isActive = draft.id === activeDraftId;
              const isEditing = editingId === draft.id;

              return (
                <div
                  key={draft.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'border-[#6D5CE8] bg-[#6D5CE8]/5'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-9 rounded-lg border border-slate-300 px-2.5 text-sm text-[#18181B]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingTitle.trim()) {
                              onRenameDraft(draft.id, editingTitle.trim());
                            }
                            setEditingId(null);
                          }}
                          className="p-2 bg-[#18B89A] text-white rounded-lg text-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDraft(draft.id);
                          onClose();
                        }}
                        className="text-left block w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-[#18181B] truncate">
                            {draft.title}
                          </span>
                          {isActive && (
                            <span className="text-[11px] font-semibold text-[#6D5CE8]">
                              · Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{draft.personalInfo.fullName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{draft.personalInfo.jobTitle}</span>
                          {draft.atsAnalysis && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums font-semibold text-[#18B89A]">
                                ATS {draft.atsAnalysis.score}%
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(draft.id);
                        setEditingTitle(draft.title);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      title="Duplicate draft"
                      onClick={() => onDuplicateDraft(draft.id)}
                      className="p-2 text-slate-500 hover:text-[#6D5CE8] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Download formatted PDF resume"
                      onClick={() => downloadResumePdf(draft)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#18B89A] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    {drafts.length > 1 && (
                      <button
                        type="button"
                        title="Delete draft"
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
