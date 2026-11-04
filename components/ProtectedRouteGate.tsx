'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ExternalLink,
  Lock,
  LogIn,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_QUOTA_UPGRADE_URL,
  FIREBASE_PRICING_URL,
} from '@/lib/firebase';

const PROTECTED_PATHS = [
  '/dashboard',
  '/resume-builder',
  '/ats-checker',
  '/job-matcher',
  '/templates',
  '/settings',
];

export default function ProtectedRouteGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthReady,
    cloudQuotaExceeded,
    dismissQuotaBanner,
    handleReloadResumesFromCloud,
    handleSaveAllDraftsToCloud,
    isCloudSyncing,
  } = useResume();

  const isProtectedWorkspace = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Automatically redirect unauthenticated visitors on protected routes to Sign Up / Login
  // preserving the exact feature they clicked in ?redirect=...
  useEffect(() => {
    if (isProtectedWorkspace && isAuthReady && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isProtectedWorkspace, isAuthReady, user, pathname, router]);

  if (isProtectedWorkspace && (!isAuthReady || !user)) {
    return (
      <main className="flex-1 bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D5CE8] bg-[#6D5CE8]/10 px-2.5 py-1 rounded-md">
              Protected Feature
            </span>
            <h1 className="font-display text-2xl font-bold text-[#18181B]">
              {!isAuthReady
                ? 'Verifying Your Session...'
                : 'Redirecting to Sign Up / Login...'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sign in with Google or Email/Password to access your private resume workspace in Cloud Firestore (<strong>{FIREBASE_PROJECT_ID}</strong>). You will be returned to{' '}
              <span className="font-mono font-semibold text-[#6D5CE8]">
                {pathname}
              </span>{' '}
              immediately after signing in.
            </p>
          </div>

          <div className="flex items-center justify-center pt-1">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Continue to Sign Up / Login</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Free-Tier Quota Exceeded Graceful Banner (Never auto-enables billing) */}
      {cloudQuotaExceeded && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">
                  Firestore Free-Tier Daily Quota Reached — Private Local Fallback Active
                </p>
                <p className="text-[11px] text-amber-800">
                  Your free daily Firestore quota will automatically reset tomorrow (paid Google Cloud billing is never enabled automatically). Your resume edits continue saving safely in your UID-isolated browser storage.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={FIREBASE_QUOTA_UPGRADE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[11px] font-bold text-amber-900 hover:bg-amber-100/60 inline-flex items-center gap-1"
              >
                <span>Firestore Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={FIREBASE_PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100/60 inline-flex items-center gap-1"
              >
                <span>Spark Plan Quotas</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={dismissQuotaBanner}
                className="text-[11px] font-bold underline px-2 py-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Cloud Sync Strip on authenticated internal pages */}
      {isProtectedWorkspace && isAuthReady && user && (
        <div className="no-print bg-slate-900 text-white px-4 py-2 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
              <span>
                Private Cloud Firestore (<strong>{FIREBASE_PROJECT_ID}</strong>) · Signed in as{' '}
                <strong className="text-[#18B89A]">
                  {user.displayName || user.email}
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isCloudSyncing}
                onClick={() => void handleSaveAllDraftsToCloud()}
                className="px-2.5 py-1 rounded-lg bg-[#6D5CE8] hover:bg-[#5B4AD6] text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-3 h-3" />
                <span>{isCloudSyncing ? 'Syncing...' : 'Save All to Cloud'}</span>
              </button>
              <button
                type="button"
                disabled={isCloudSyncing}
                onClick={() => void handleReloadResumesFromCloud()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload from Cloud</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
