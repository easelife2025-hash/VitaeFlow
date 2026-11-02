'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  X,
  Check,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Layers,
  Briefcase,
  Wrench,
  AlignLeft,
} from 'lucide-react';
import {
  ResumeDraft,
  WholeResumePolishResult,
  AiUsageMetadata,
} from '@/lib/types';
import { buildFactSafeWholeResumePolish } from '@/lib/ai-fallback';

interface AiFullResumePolishModalProps {
  isOpen: boolean;
  resume: ResumeDraft;
  customLimit?: number;
  onUsageUpdate?: (usage: AiUsageMetadata) => void;
  onApplyPolishedResume: (updatedResume: ResumeDraft) => void;
  onClose: () => void;
}

export default function AiFullResumePolishModal({
  isOpen,
  resume,
  customLimit = 50,
  onUsageUpdate,
  onApplyPolishedResume,
  onClose,
}: AiFullResumePolishModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WholeResumePolishResult | null>(null);

  // Selection & editable states
  const [applySummary, setApplySummary] = useState(true);
  const [editableSummary, setEditableSummary] = useState('');
  const [selectedBulletIds, setSelectedBulletIds] = useState<Set<string>>(
    new Set()
  );
  const [editableBullets, setEditableBullets] = useState<
    Record<string, string>
  >({});
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const onUsageUpdateRef = useRef(onUsageUpdate);
  useEffect(() => {
    onUsageUpdateRef.current = onUsageUpdate;
  }, [onUsageUpdate]);

  const autoTriggeredForResumeRef = useRef<string>('');

  const populateFromResult = useCallback((res: WholeResumePolishResult) => {
    setResult(res);
    setApplySummary(true);
    setEditableSummary(res.improvedSummary);

    const bulletIds = new Set<string>();
    const bulletMap: Record<string, string> = {};
    for (const b of res.bulletUpgrades) {
      bulletIds.add(b.id);
      bulletMap[b.id] = b.improved;
    }
    setSelectedBulletIds(bulletIds);
    setEditableBullets(bulletMap);

    setSelectedSkills(new Set(res.recommendedSkills.map((s) => s.skill)));
  }, []);

  const runFullResumePolish = useCallback(async () => {
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const res = await fetch('/api/ai/polish-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-custom-limit': String(customLimit),
        },
        body: JSON.stringify({ resume }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (data.usage && onUsageUpdateRef.current) {
        onUsageUpdateRef.current(data.usage);
      }

      if (res.ok && data.polishResult) {
        populateFromResult(data.polishResult as WholeResumePolishResult);
      } else {
        populateFromResult(buildFactSafeWholeResumePolish(resume));
      }
    } catch {
      populateFromResult(buildFactSafeWholeResumePolish(resume));
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [resume, customLimit, populateFromResult]);

  useEffect(() => {
    if (!isOpen) {
      autoTriggeredForResumeRef.current = '';
      return;
    }

    const triggerKey = `${resume.id}:${resume.updatedAt}`;
    if (autoTriggeredForResumeRef.current === triggerKey) {
      return;
    }
    autoTriggeredForResumeRef.current = triggerKey;
    void runFullResumePolish();
  }, [isOpen, resume.id, resume.updatedAt, runFullResumePolish]);

  if (!isOpen) return null;

  const toggleBullet = (id: string) => {
    setSelectedBulletIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleCommitAllSelected = () => {
    if (!result) return;

    const nextExperience = (resume.experience || []).map((exp) => {
      const nextBullets = (exp.bullets || []).map((origBullet, idx) => {
        const upgradeId = `exp-${exp.id}-${idx}`;
        if (selectedBulletIds.has(upgradeId) && editableBullets[upgradeId]) {
          return editableBullets[upgradeId].trim();
        }
        return origBullet;
      });
      return { ...exp, bullets: nextBullets };
    });

    const nextProjects = (resume.projects || []).map((proj) => {
      const nextBullets = (proj.bullets || []).map((origBullet, idx) => {
        const upgradeId = `proj-${proj.id}-${idx}`;
        if (selectedBulletIds.has(upgradeId) && editableBullets[upgradeId]) {
          return editableBullets[upgradeId].trim();
        }
        return origBullet;
      });
      return { ...proj, bullets: nextBullets };
    });

    const mergedSkills = Array.from(
      new Set([...(resume.skills || []), ...Array.from(selectedSkills)])
    );

    const updatedResume: ResumeDraft = {
      ...resume,
      updatedAt: new Date().toISOString(),
      personalInfo: {
        ...resume.personalInfo,
        summary:
          applySummary && editableSummary.trim()
            ? editableSummary.trim()
            : resume.personalInfo.summary,
      },
      experience: nextExperience,
      projects: nextProjects,
      skills: mergedSkills,
    };

    onApplyPolishedResume(updatedResume);
    onClose();
  };

  const totalSelectedCount =
    (applySummary ? 1 : 0) + selectedBulletIds.size + selectedSkills.size;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-whole-resume-modal-title"
    >
      <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2
              id="ai-whole-resume-modal-title"
              className="font-display text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#6D5CE8]" />
              <span>AI Polish & Align Whole Resume</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Holistic cross-section optimization for{' '}
              <span className="font-semibold text-slate-700">
                {resume.personalInfo.jobTitle || resume.targetRole || 'Your Resume'}
              </span>{' '}
              · Analyzes Experience, Projects, Skills & Summary together
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void runFullResumePolish()}
              disabled={isLoading}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#6D5CE8] ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Re-Analyze</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-[#18181B] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Fact-Preserving & Whole-Resume Context Strip */}
          <div className="p-3.5 rounded-xl bg-[#18B89A]/8 border border-[#18B89A]/25 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0" />
              <span>
                <strong className="text-[#18181B]">
                  Whole-Resume Fact-Safe Co-Pilot:
                </strong>{' '}
                Substantially restructures phrasing, clause hierarchy, and
                executive vocabulary across your entire resume while keeping
                your real career facts and metrics 100% intact.
              </span>
            </div>
            {result && result.alignmentHighlights.length > 0 && (
              <div className="pt-1.5 border-t border-[#18B89A]/20 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
                {result.alignmentHighlights.map((hl, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#6D5CE8] shrink-0" />
                    <span>{hl}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-3"
                >
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3.5 w-full bg-slate-200 rounded" />
                  <div className="h-3.5 w-5/6 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-6">
              {/* 1. Holistic Summary Upgrade */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-[#6D5CE8]" />
                    <h3 className="font-display text-sm font-bold text-[#18181B]">
                      1. Holistic Professional Summary (Synthesized from Full Resume)
                    </h3>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applySummary}
                      onChange={(e) => setApplySummary(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#6D5CE8] cursor-pointer"
                    />
                    <span>Apply Summary</span>
                  </label>
                </div>

                {resume.personalInfo.summary && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-600 block">
                      Current Summary Draft:
                    </span>
                    <p className="leading-relaxed">{resume.personalInfo.summary}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#6D5CE8] block">
                    AI Restructured & Aligned Summary (Editable):
                  </span>
                  <textarea
                    rows={3}
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
                    <span>{result.summaryReasoning}</span>
                  </p>
                </div>
              </div>

              {/* 2. Substantially Restructured Experience & Project Bullets */}
              {result.bulletUpgrades.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#6D5CE8]" />
                      <h3 className="font-display text-sm font-bold text-[#18181B]">
                        2. Restructured Experience & Project Bullets ({selectedBulletIds.size}/{result.bulletUpgrades.length} selected)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          selectedBulletIds.size ===
                          result.bulletUpgrades.length
                        ) {
                          setSelectedBulletIds(new Set());
                        } else {
                          setSelectedBulletIds(
                            new Set(result.bulletUpgrades.map((b) => b.id))
                          );
                        }
                      }}
                      className="text-xs font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
                    >
                      {selectedBulletIds.size === result.bulletUpgrades.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {result.bulletUpgrades.map((item) => {
                      const isChecked = selectedBulletIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-4 transition-all space-y-2.5 ${
                            isChecked
                              ? 'border-[#6D5CE8]/40 bg-white'
                              : 'border-slate-200 bg-slate-50/50 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {item.contextLabel}
                            </span>
                            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleBullet(item.id)}
                                className="w-4 h-4 rounded accent-[#6D5CE8] cursor-pointer"
                              />
                              <span>Apply Rewrite</span>
                            </label>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">
                              Original:{' '}
                            </span>
                            <span>{item.original}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#6D5CE8] block">
                              AI Restructured Version:
                            </span>
                            <textarea
                              rows={2}
                              value={editableBullets[item.id] ?? item.improved}
                              onChange={(e) =>
                                setEditableBullets((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none"
                            />
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-[#18B89A] shrink-0" />
                            <span>{item.changeSummary}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Evidenced Skills to Add */}
              {result.recommendedSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#6D5CE8]" />
                    <h3 className="font-display text-sm font-bold text-[#18181B]">
                      3. Evidenced Skills from Your Experience & Projects ({selectedSkills.size} selected)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.recommendedSkills.map((sk) => {
                      const isSelected = selectedSkills.has(sk.skill);
                      return (
                        <button
                          key={sk.skill}
                          type="button"
                          onClick={() => toggleSkill(sk.skill)}
                          className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'border-[#6D5CE8] bg-[#6D5CE8]/5'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                              isSelected
                                ? 'bg-[#6D5CE8] text-white'
                                : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-[#18181B]">
                              {sk.skill}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-snug">
                              {sk.reason}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Nothing is overwritten until you click Apply · All changes remain editable
          </span>
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading || totalSelectedCount === 0}
              onClick={handleCommitAllSelected}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#18B89A] hover:bg-[#149E83] disabled:opacity-50 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                Apply Selected Improvements ({totalSelectedCount})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
