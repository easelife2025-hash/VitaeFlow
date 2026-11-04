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
  Cloud,
  LogIn,
  LogOut,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { TemplateId, AccentColor } from '@/lib/types';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_PRICING_URL,
  FIREBASE_QUOTA_UPGRADE_URL,
} from '@/lib/firebase';

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
    user,
    isCloudSyncing,
    lastCloudSyncedAt,
    isProtectedRouteEnforced,
    setIsProtectedRouteEnforced,
    openAuthModal,
    handleSaveAllDraftsToCloud,
    handleReloadResumesFromCloud,
    handleSignOut,
    handleDeleteAccountAndData,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

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
            <span>Workspace Configuration, Cloud Sync &amp; Privacy</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Application Settings &amp; Firebase Cloud Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Manage your Firebase Authentication &amp; Cloud Firestore account (<strong>{FIREBASE_PROJECT_ID}</strong>), configure Gemini AI rate limits, export full data backups, or delete your account and cloud records.
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

        {/* 0. Firebase Authentication, Cloud Firestore Sync & Account Deletion */}
        <section className="bg-white border-2 border-[#6D5CE8]/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base sm:text-lg font-bold text-[#18181B]">
                    Firebase Authentication &amp; Cloud Firestore
                  </h2>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#6D5CE8]/10 text-[#6D5CE8]">
                    {FIREBASE_PROJECT_ID}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Every saved resume is associated with your authenticated UID (`ownerId == request.auth.uid`) and protected by zero-trust Firestore Security Rules.
                </p>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#18B89A]/15 text-[#18181B]">
                  <span className="w-2 h-2 rounded-full bg-[#18B89A]" />
                  <span>{user.email || user.displayName}</span>
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSignOut();
                    setStatusBanner({
                      type: 'success',
                      message: 'Signed out of Firebase Authentication.',
                    });
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google or Email</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cloud Sync Actions */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B]">
                  Cloud Resume Synchronization
                </span>
                {lastCloudSyncedAt && (
                  <span className="text-[11px] font-mono text-[#18B89A] font-semibold">
                    Synced {new Date(lastCloudSyncedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Database ID: <span className="font-mono">{FIRESTORE_DATABASE_ID}</span>. Save all {drafts.length} resume draft(s) to Firestore or reload your cloud resumes at any time.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!user || isCloudSyncing}
                  onClick={async () => {
                    const ok = await handleSaveAllDraftsToCloud();
                    setStatusBanner(
                      ok
                        ? {
                            type: 'success',
                            message: `Saved ${drafts.length} resume(s) to Cloud Firestore under UID ${user?.uid}.`,
                          }
                        : {
                            type: 'error',
                            message:
                              'Could not save to Cloud Firestore. Ensure you are signed in.',
                          }
                    );
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>
                    {isCloudSyncing ? 'Syncing...' : `Save All to Cloud (${drafts.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!user || isCloudSyncing}
                  onClick={async () => {
                    const ok = await handleReloadResumesFromCloud();
                    setStatusBanner(
                      ok
                        ? {
                            type: 'success',
                            message: 'Reloaded your latest resumes from Cloud Firestore.',
                          }
                        : {
                            type: 'error',
                            message: 'Could not reload from Cloud Firestore.',
                          }
                    );
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs font-semibold text-[#18181B] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#6D5CE8]" />
                  <span>Reload Resumes from Cloud</span>
                </button>
              </div>
            </div>

            {/* Protected Routes & Quota Policy */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B]">
                  Protected Routes &amp; Free-Tier Quota Guard
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isProtectedRouteEnforced;
                    setIsProtectedRouteEnforced(next);
                    setStatusBanner({
                      type: 'success',
                      message: next
                        ? 'Strict Protected Route Lock enabled. Workspace routes now require Firebase sign-in.'
                        : 'Protected Route Lock set to optional (Guest Mode allowed).',
                    });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    isProtectedRouteEnforced
                      ? 'bg-[#18B89A] text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isProtectedRouteEnforced ? 'Strict Lock ON' : 'Optional Lock'}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Free-tier quota errors are handled gracefully with automatic local storage fallback and never automatically enable paid billing.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <a
                  href={FIREBASE_QUOTA_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#6D5CE8] hover:underline inline-flex items-center gap-1"
                >
                  <span>Firestore Database Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={FIREBASE_PRICING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Spark Plan Free-Tier Limits</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Account Deletion & Full Data Export */}
          {user && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <strong className="text-[#18181B]">Account Deletion &amp; Data Rights:</strong>{' '}
                Export all your cloud/local data as JSON or permanently delete your Firebase account and all associated Firestore records.
              </div>
              {!confirmDeleteAccount ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAccount(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Delete Account &amp; Cloud Data</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-red-800">
                    Permanently delete your account &amp; all cloud resumes?
                  </span>
                  <button
                    type="button"
                    disabled={isCloudSyncing}
                    onClick={async () => {
                      const res = await handleDeleteAccountAndData();
                      setConfirmDeleteAccount(false);
                      setStatusBanner(
                        res.ok
                          ? {
                              type: 'success',
                              message:
                                'Your Firebase account and all associated Firestore resumes and profile data have been permanently deleted.',
                            }
                          : {
                              type: 'error',
                              message:
                                res.error || 'Could not delete account.',
                            }
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAccount(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

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
                      AI Usage &amp; Auto-Model Failover
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
                  <span className="font-mono">Gemini 3.1 Flash Lite</span>.
                </p>
              </div>

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
                Reset counter &amp; return to primary model:
              </span>
              <button
                type="button"
                onClick={() => {
                  handleResetAiQuota();
                  setStatusBanner({
                    type: 'success',
                    message:
                      'AI usage counter reset and restored to primary model (Gemini 3.8 Flash).',
                  });
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Quota &amp; Model</span>
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
                    Default Template &amp; Accent Preferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Synced with your `/users/&#123;uid&#125;` Firestore profile when signed in
                  </p>
                </div>
              </div>

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
                    Full Data Export &amp; JSON Portability
                  </h2>
                  <p className="text-xs text-slate-500">
                    Export all {drafts.length} saved resume draft(s) and account metadata
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Download a complete `.json` export of your resumes, preferences, and owner metadata at any time, or restore from a backup file.
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
                  <span>Export All Data JSON ({drafts.length})</span>
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

          {/* 4. Privacy, Server Secrets & Local Storage Management */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#18B89A]/10 text-[#18B89A] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#18181B]">
                      Security Architecture &amp; Local Cache
                    </h2>
                    <p className="text-xs text-slate-500">
                      Server-only secrets &amp; zero Firebase Storage binary buckets
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {storageSizeKb} KB cached
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#6D5CE8] shrink-0 mt-0.5" />
                  <span>
                    <strong>Server-Only Secrets:</strong> Private API keys (`GEMINI_API_KEY`) are stored exclusively in server-side environment variables and never exposed to the client.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                  <span>
                    <strong>No Firebase Storage Used:</strong> Structured resume documents are stored directly in Cloud Firestore and mirrored in `window.localStorage` for offline resilience.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {!confirmClear ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Wipe local browser cache and reset local draft:
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Local Cache</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-red-800">
                    Confirm clearing local browser cache?
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
                            'Cleared browser local cache and initialized a fresh blank resume.',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Yes, Clear Cache
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
