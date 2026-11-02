'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Settings,
  Gauge,
  Palette,
  Database,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { TemplateId, AccentColor } from '@/lib/types';

const TEMPLATE_OPTIONS: { id: TemplateId; label: string; desc: string }[] = [
  {
    id: 'modern-violet',
    label: 'Modern Minimalist',
    desc: 'Top accent bar, soft header tint, and vertical section markers.',
  },
  {
    id: 'executive-minimal',
    label: 'Executive Corporate',
    desc: 'Centered corporate header with double horizontal rule.',
  },
  {
    id: 'teal-split',
    label: 'Split Column Sidebar',
    desc: 'Asymmetric tinted sidebar for credentials + main narrative column.',
  },
  {
    id: 'creative-studio',
    label: 'Creative Studio',
    desc: 'Bold solid banner block, timeline experience, and visual skill chips.',
  },
  {
    id: 'professional-ats',
    label: 'Professional Standard',
    desc: 'Traditional high-density ATS layout with classic full-width rules.',
  },
  {
    id: 'elegant-editorial',
    label: 'Elegant Editorial',
    desc: 'Sophisticated ornamental diamond dividers and editorial typography.',
  },
];

const ACCENT_OPTIONS: { color: AccentColor; label: string }[] = [
  { color: '#6D5CE8', label: 'Brand Violet (#6D5CE8)' },
  { color: '#18B89A', label: 'Brand Teal (#18B89A)' },
  { color: '#18181B', label: 'Executive Charcoal (#18181B)' },
];

export default function SettingsPage() {
  const {
    drafts,
    preferences,
    handleUpdatePreferences,
    aiUsage,
    customAiLimit,
    handleChangeCustomAiLimit,
    handleResetAiQuota,
    handleExportAllJsonBackup,
    handleRestoreJsonBackup,
    handleResetToSampleResumes,
    handleClearLocalStorage,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const storageSizeKb = useMemo(() => {
    try {
      const serialized = JSON.stringify(drafts);
      return (new Blob([serialized]).size / 1024).toFixed(1);
    } catch {
      return '0.0';
    }
  }, [drafts]);

  const handleBackupFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = handleRestoreJsonBackup(text);
      if (result.ok) {
        setStatusBanner({
          type: 'success',
          message: `Successfully restored ${result.count} resume draft(s) from backup.`,
        });
      } else {
        setStatusBanner({
          type: 'error',
          message: result.error || 'Could not restore backup file.',
        });
      }
    } catch {
      setStatusBanner({
        type: 'error',
        message: 'Failed to read the selected JSON file.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
            <Settings className="w-4 h-4" />
            <span>Workspace Configuration & Privacy</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Application Settings & Data Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Configure your server-side Gemini AI rate limits, set default styling for new resumes, export portable JSON backups, and manage browser storage.
          </p>
        </div>

        {statusBanner && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
              statusBanner.type === 'success'
                ? 'bg-[#18B89A]/10 border-[#18B89A]/30 text-[#18181B]'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. AI Usage Quota & Automatic Multi-Model Failover Controls */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#18181B]">
                      AI Usage & Auto-Model Failover
                    </h2>
                    <p className="text-xs text-slate-500">
                      Automatically switches Gemini models when a limit is reached
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#6D5CE8] bg-[#6D5CE8]/10 px-2.5 py-1 rounded-lg">
                  {aiUsage.used} / {aiUsage.limit} on active model
                </span>
              </div>

              {/* Active Model & Failover Chain Info */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#18181B]">
                    Active Model:
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#6D5CE8]">
                    <span className="w-2 h-2 rounded-full bg-[#18B89A]" />
                    {aiUsage.activeModelLabel || 'Gemini 3.8 Flash'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Auto-Switch Chain:</strong>{' '}
                  <span className="font-mono">Gemini 3.8 Flash</span> →{' '}
                  <span className="font-mono">Gemini Flash Latest</span> →{' '}
                  <span className="font-mono">Gemini 3.1 Flash Lite</span>. When any model reaches its request threshold or encounters a rate limit, VitaeFlow automatically switches to the next model with a fresh quota window.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Remaining before automatic model switch
                  </span>
                  <span className="font-mono font-bold text-[#18B89A]">
                    {aiUsage.remaining} requests
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6D5CE8] to-[#18B89A] rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (aiUsage.remaining / Math.max(1, aiUsage.limit)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Per-Model Threshold Selector */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#18181B]">
                  Per-Model Auto-Switch Threshold:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[15, 30, 50, 100, 250].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        handleChangeCustomAiLimit(val);
                        setStatusBanner({
                          type: 'success',
                          message: `Per-model auto-switch threshold updated to ${val} requests/model.`,
                        });
                      }}
                      className={`min-h-[38px] rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                        customAiLimit === val
                          ? 'border-[#6D5CE8] bg-[#6D5CE8] text-white'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Reset counter & return to primary model:
              </span>
              <button
                type="button"
                onClick={() => {
                  handleResetAiQuota();
                  setStatusBanner({
                    type: 'success',
                    message: 'AI usage counter reset and restored to primary model (Gemini 3.8 Flash).',
                  });
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Quota & Model</span>
              </button>
            </div>
          </section>

          {/* 2. Default Template & Accent Color Preferences */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#18B89A]/10 text-[#18B89A] flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#18181B]">
                    Default Template & Accent Preferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Applied automatically when creating or importing new resumes
                  </p>
                </div>
              </div>

              {/* Default Template */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#18181B]">
                  Default A4 Template Layout:
                </label>
                <div className="space-y-2">
                  {TEMPLATE_OPTIONS.map((tpl) => {
                    const isSelected =
                      preferences.defaultTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          handleUpdatePreferences({
                            defaultTemplateId: tpl.id,
                          });
                          setStatusBanner({
                            type: 'success',
                            message: `Default template set to ${tpl.label}.`,
                          });
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#6D5CE8] bg-[#6D5CE8]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#18181B]">
                            {tpl.label}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-semibold text-[#6D5CE8]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tpl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Accent Color */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#18181B]">
                  Default Heading Accent Color:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCENT_OPTIONS.map((acc) => {
                    const isSelected =
                      preferences.defaultAccentColor === acc.color;
                    return (
                      <button
                        key={acc.color}
                        type="button"
                        onClick={() => {
                          handleUpdatePreferences({
                            defaultAccentColor: acc.color,
                          });
                          setStatusBanner({
                            type: 'success',
                            message: `Default accent updated to ${acc.label}.`,
                          });
                        }}
                        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-[#6D5CE8] bg-slate-50 font-bold text-[#18181B]'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: acc.color }}
                        />
                        <span className="truncate">
                          {acc.label.split(' ')[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Full Resume Data Backup, JSON Export & Reset Controls */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#18181B]">
                    Full Resume Data Backup & JSON Portability
                  </h2>
                  <p className="text-xs text-slate-500">
                    Export all {drafts.length} saved resume draft(s) or restore from a backup file
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Keep a portable `.json` archive of all your resumes and preferences so you can transfer them across browsers or devices anytime.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleExportAllJsonBackup();
                    setStatusBanner({
                      type: 'success',
                      message: `Exported ${drafts.length} resume draft(s) as a portable JSON backup.`,
                    });
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Backup ({drafts.length})</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleBackupFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 hover:border-[#18B89A] bg-white text-xs font-semibold text-[#18181B] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#18B89A]" />
                  <span>Restore From JSON</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Restore default sample engineering/product resumes:
              </span>
              <button
                type="button"
                onClick={() => {
                  handleResetToSampleResumes();
                  setStatusBanner({
                    type: 'success',
                    message: 'Restored default sample resumes.',
                  });
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Reset Sample Data
              </button>
            </div>
          </section>

          {/* 4. Privacy & Local Storage Management Controls */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#18B89A]/10 text-[#18B89A] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#18181B]">
                      Privacy & Local Browser Storage
                    </h2>
                    <p className="text-xs text-slate-500">
                      Zero server-side database tracking of your personal drafts
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {storageSizeKb} KB used
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#6D5CE8] shrink-0 mt-0.5" />
                  <span>
                    <strong>Server-Side Gemini API Key Protection:</strong>{' '}
                    `GEMINI_API_KEY` is stored strictly on the server and never sent to the client browser.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Local-First Persistence:</strong> Your drafts live in `window.localStorage` (`vitaeflow_resumes_v2`) so you remain in full control of your career data.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {!confirmClear ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Wipe all local storage data and start fresh:
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Local Storage</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-red-800">
                    Confirm clearing all saved browser drafts?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleClearLocalStorage();
                        setConfirmClear(false);
                        setStatusBanner({
                          type: 'success',
                          message:
                            'Cleared browser local storage and initialized a fresh blank resume.',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
