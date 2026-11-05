'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wand2,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  BulletTone,
  AiEnhancerMode,
  EnhancedBulletVariation,
  AiUsageMetadata,
  WholeResumeContextSnapshot,
} from '@/lib/types';
import { buildFactSafeBulletVariations } from '@/lib/ai-fallback';
import { authenticatedFetch } from '@/lib/firebase';

interface AiBulletModalProps {
  isOpen: boolean;
  initialText: string;
  roleTitle: string;
  companyName?: string;
  mode?: AiEnhancerMode;
  missingAtsKeywords?: string[];
  resumeContext?: WholeResumeContextSnapshot;
  customLimit?: number;
  onUsageUpdate?: (usage: AiUsageMetadata) => void;
  onClose: () => void;
  onApply: (newText: string) => void;
}

export default function AiBulletModal({
  isOpen,
  initialText,
  roleTitle,
  companyName = '',
  mode = 'rewrite_bullet',
  missingAtsKeywords = [],
  resumeContext,
  customLimit = 50,
  onUsageUpdate,
  onClose,
  onApply,
}: AiBulletModalProps) {
  const [activeMode, setActiveMode] = useState<AiEnhancerMode>(mode);
  const [draftText, setDraftText] = useState(initialText);
  const [selectedTone, setSelectedTone] = useState<BulletTone>(
    mode === 'improve_wording' ? 'clarity' : 'impact'
  );
  const [variations, setVariations] = useState<EnhancedBulletVariation[]>([]);
  const [editableVariations, setEditableVariations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUsageUpdateRef = useRef(onUsageUpdate);
  useEffect(() => {
    onUsageUpdateRef.current = onUsageUpdate;
  }, [onUsageUpdate]);

  const resumeContextRef = useRef(resumeContext);
  useEffect(() => {
    resumeContextRef.current = resumeContext;
  }, [resumeContext]);

  const autoTriggeredKeyRef = useRef<string>('');

  const handleGenerate = useCallback(
    async (
      toneOverride?: BulletTone,
      textOverride?: string,
      modeOverride?: AiEnhancerMode
    ) => {
      const targetText = (textOverride ?? draftText).trim();
      if (!targetText) {
        setError('Enter a sentence or bullet point first.');
        return;
      }

      const effectiveTone = toneOverride || selectedTone;
      const effectiveMode = modeOverride || activeMode;

      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await authenticatedFetch('/api/ai/enhance-bullet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ai-custom-limit': String(customLimit),
          },
          body: JSON.stringify({
            bullet: targetText,
            role: roleTitle || resumeContextRef.current?.jobTitle || 'Professional',
            company: companyName,
            tone: effectiveTone,
            mode: effectiveMode,
            targetKeywords: missingAtsKeywords,
            resumeContext: resumeContextRef.current,
          }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));
        if (data.usage && onUsageUpdateRef.current) {
          onUsageUpdateRef.current(data.usage);
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate AI suggestions.');
        }

        const list: EnhancedBulletVariation[] =
          Array.isArray(data.variations) && data.variations.length > 0
            ? data.variations
            : buildFactSafeBulletVariations({
                bullet: targetText,
                role:
                  roleTitle ||
                  resumeContextRef.current?.jobTitle ||
                  'Professional',
                company: companyName,
                tone: effectiveTone,
                mode: effectiveMode,
                targetKeywords: missingAtsKeywords,
                resumeContext: resumeContextRef.current,
              });

        setVariations(list);
        setEditableVariations(list.map((v) => v.text));
      } catch {
        const fallbackList = buildFactSafeBulletVariations({
          bullet: targetText,
          role:
            roleTitle || resumeContextRef.current?.jobTitle || 'Professional',
          company: companyName,
          tone: effectiveTone,
          mode: effectiveMode,
          targetKeywords: missingAtsKeywords,
          resumeContext: resumeContextRef.current,
        });
        setVariations(fallbackList);
        setEditableVariations(fallbackList.map((v) => v.text));
        setError(null);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [
      draftText,
      roleTitle,
      companyName,
      selectedTone,
      activeMode,
      missingAtsKeywords,
      customLimit,
    ]
  );

  useEffect(() => {
    if (!isOpen) {
      autoTriggeredKeyRef.current = '';
      return;
    }

    const triggerKey = `${mode}:${initialText.trim()}`;
    if (autoTriggeredKeyRef.current === triggerKey) {
      return;
    }
    autoTriggeredKeyRef.current = triggerKey;

    setActiveMode(mode);
    const initialTone: BulletTone =
      mode === 'improve_wording' ? 'clarity' : 'impact';
    setSelectedTone(initialTone);
    setDraftText(initialText);
    setVariations([]);
    setEditableVariations([]);
    setError(null);

    if (initialText.trim().length > 4) {
      const timer = setTimeout(() => {
        void handleGenerate(initialTone, initialText, mode);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialText, mode, handleGenerate]);

  if (!isOpen) return null;

  const contextSkillCount = resumeContext?.skills?.length || 0;
  const contextExpCount = resumeContext?.experience?.length || 0;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-bullet-modal-title"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2
              id="ai-bullet-modal-title"
              className="font-display text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-[#6D5CE8]" />
              <span>
                {activeMode === 'improve_wording'
                  ? 'AI Improve Wording & Clarity'
                  : 'AI Bullet Point Rewriter'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tailoring for{' '}
              <span className="font-medium text-slate-700">
                {roleTitle || resumeContext?.jobTitle || 'Your Role'}
              </span>
              {companyName ? ` · ${companyName}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-[#18181B] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Fact-Preservation & Whole-Resume Context Strip */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#18B89A]/8 border border-[#18B89A]/25 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0" />
              <span>
                <strong className="text-[#18181B]">
                  Substantial Fact-Safe Restructuring:
                </strong>{' '}
                Rebuilds clause order, outcome focus, and executive vocabulary
                while keeping your real metrics and facts 100% accurate.
              </span>
            </div>
            {(contextSkillCount > 0 || contextExpCount > 0) && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pl-6">
                <Layers className="w-3 h-3 text-[#6D5CE8] shrink-0" />
                <span>
                  Whole-Resume Context Active: Aligned with {contextExpCount}{' '}
                  roles and {contextSkillCount} skills from your resume
                </span>
              </div>
            )}
          </div>

          {/* Mode Toggle: Rewrite Bullet vs Improve Wording */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveMode('rewrite_bullet');
                setSelectedTone('impact');
                void handleGenerate('impact', draftText, 'rewrite_bullet');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'rewrite_bullet'
                  ? 'bg-white text-[#6D5CE8] shadow-xs'
                  : 'text-slate-600 hover:text-[#18181B]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Rewrite Bullet Point</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('improve_wording');
                setSelectedTone('clarity');
                void handleGenerate('clarity', draftText, 'improve_wording');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'improve_wording'
                  ? 'bg-white text-[#6D5CE8] shadow-xs'
                  : 'text-slate-600 hover:text-[#18181B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Improve Wording & Polish</span>
            </button>
          </div>

          {/* Source Input */}
          <div>
            <label
              htmlFor="source-bullet-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Original Text (Your Stated Facts)
            </label>
            <textarea
              id="source-bullet-input"
              rows={2}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Enter your sentence or bullet point..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-slate-400 focus:bg-white focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15 transition-all"
            />
          </div>

          {/* Tone Selection & Generate Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { id: 'impact', label: 'Action & Outcome' },
                  { id: 'clarity', label: 'Polished Wording' },
                  { id: 'leadership', label: 'Ownership Focus' },
                  { id: 'concise', label: 'Concise ATS' },
                ] as { id: BulletTone; label: string }[]
              ).map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => {
                    setSelectedTone(tone.id);
                    void handleGenerate(tone.id);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTone === tone.id
                      ? 'bg-white text-[#6D5CE8] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-[#18181B]'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isLoading}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>
                {isLoading ? 'Generating...' : 'Regenerate Suggestions'}
              </span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-start justify-between gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-2.5"
                >
                  <div className="h-3.5 w-36 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-4/5 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Review-Before-Apply Variations List */}
          {!isLoading && variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Review & optionally edit a restructured suggestion before applying:
                </p>
                <span className="text-[11px] text-slate-400">
                  Nothing changes until you click Apply
                </span>
              </div>
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-white transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#6D5CE8]">
                        {v.toneLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Lead verb:{' '}
                        <strong className="text-[#18181B]">
                          {v.actionVerb}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onApply(editableVariations[idx] || v.text);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#18B89A] hover:bg-[#149E83] rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply to Resume</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={editableVariations[idx] ?? v.text}
                    onChange={(e) => {
                      const next = [...editableVariations];
                      next[idx] = e.target.value;
                      setEditableVariations(next);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-2.5 text-sm text-[#18181B] leading-relaxed focus:bg-white focus:border-[#6D5CE8] focus:outline-none"
                  />

                  {v.metricsAdded && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-[#18B89A] shrink-0" />
                      <span>{v.metricsAdded}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by server-side Gemini · Whole-resume context active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Cancel & Keep Original
          </button>
        </div>
      </div>
    </div>
  );
}
