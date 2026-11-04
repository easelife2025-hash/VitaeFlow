'use client';

import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  LogIn,
  UserPlus,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  validateEmailPasswordInput,
  FIREBASE_PROJECT_ID,
  FIREBASE_AUTH_PROVIDERS_CONSOLE_URL,
  FIREBASE_AUTH_SETTINGS_CONSOLE_URL,
  FIREBASE_AUTHORIZED_CONTINUE_URL,
} from '@/lib/firebase';
import { useResume } from '@/context/ResumeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, handleRefreshAuthUser } = useResume();
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsProviderEnableHelp, setNeedsProviderEnableHelp] = useState(false);
  const [unauthorizedDomainHost, setUnauthorizedDomainHost] = useState<
    string | null
  >(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCurrentHostname = (): string => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'vitae-flow-xi.vercel.app';
  };

  const handleCopyDomain = async () => {
    const domain = unauthorizedDomainHost || getCurrentHostname();
    try {
      await navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsProviderEnableHelp(false);
    setUnauthorizedDomainHost(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const message = err instanceof Error ? err.message : String(err);
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed before completing.');
      } else if (
        code === 'auth/unauthorized-domain' ||
        message.includes('auth/unauthorized-domain')
      ) {
        const host = getCurrentHostname();
        setUnauthorizedDomainHost(host);
        setErrorMsg(
          `Your deployment domain (${host}) needs to be added to Authorized Domains in Firebase Console for Google Popup Sign-In — or create your account right now using Email & Password below.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setNeedsProviderEnableHelp(true);
        setErrorMsg(
          'Google Sign-In is not enabled yet in your Firebase Console.'
        );
      } else {
        setErrorMsg(message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsProviderEnableHelp(false);
    setUnauthorizedDomainHost(null);

    if (tab === 'reset') {
      const check = validateEmailPasswordInput(email);
      if (!check.valid) {
        setErrorMsg(check.error || 'Invalid email.');
        return;
      }
      setLoading(true);
      try {
        try {
          await sendPasswordResetEmail(auth, email.trim(), {
            url: FIREBASE_AUTHORIZED_CONTINUE_URL,
          });
        } catch {
          await sendPasswordResetEmail(auth, email.trim());
        }
        setInfoMsg(
          'Password reset email sent! Check your inbox for instructions.'
        );
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Could not send reset email.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = validateEmailPasswordInput(
      email,
      password,
      tab === 'signup' ? displayName : undefined
    );
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please check your input fields.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        if (displayName.trim()) {
          await updateProfile(cred.user, {
            displayName: displayName.trim().slice(0, 120),
          });
        }
        try {
          await sendEmailVerification(cred.user, {
            url: FIREBASE_AUTHORIZED_CONTINUE_URL,
          });
        } catch {
          // Non-blocking verification email dispatch
        }
        await handleRefreshAuthUser();
        onClose();
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onClose();
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const message = err instanceof Error ? err.message : String(err);
      if (
        code === 'auth/unauthorized-domain' ||
        message.includes('auth/unauthorized-domain')
      ) {
        const host = getCurrentHostname();
        setUnauthorizedDomainHost(host);
        setErrorMsg(
          `Domain (${host}) is not yet listed under Firebase Console → Authentication → Settings → Authorized domains.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setNeedsProviderEnableHelp(true);
        setErrorMsg(
          'Email/Password authentication is not enabled yet in your Firebase project.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg(
          'An account with this email already exists. Switch to Sign In.'
        );
      } else {
        setErrorMsg(message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: FIREBASE_AUTHORIZED_CONTINUE_URL,
      });
      setInfoMsg('Verification email sent! Check your inbox and spam folder.');
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not resend verification email.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await handleRefreshAuthUser();
      if (auth.currentUser?.emailVerified) {
        setInfoMsg('Email verified! Cloud Firestore sync is active.');
        setTimeout(() => onClose(), 900);
      } else {
        setErrorMsg(
          'Your email is still marked as unverified. Click the link in your email first, then click Refresh Status.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#18181B] hover:bg-slate-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6D5CE8] bg-[#6D5CE8]/10 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Cloud Sync ({FIREBASE_PROJECT_ID})</span>
          </div>
          <h2
            id="auth-modal-title"
            className="font-display text-xl font-bold text-[#18181B]"
          >
            {user
              ? 'Account & Email Verification'
              : tab === 'signin'
                ? 'Sign In to Save & Sync Resumes'
                : tab === 'signup'
                  ? 'Create Your VitaeFlow Account'
                  : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500">
            Associate every resume with your authenticated UID and sync securely across devices via Cloud Firestore.
          </p>
        </div>

        {/* If user is signed in */}
        {user && !user.emailVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Optional Email Verification</p>
                <p>
                  Signed in as <strong>{user.email}</strong>. Your cloud sync is active! You can also verify your email address below.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleCheckVerified}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>I&apos;ve Verified — Refresh Status</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleResendVerification}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-100/50 cursor-pointer"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>

            {unauthorizedDomainHost && (
              <div className="pt-2 border-t border-red-200/80 space-y-2 text-[11px] text-slate-800 bg-white/90 p-2.5 rounded-xl border border-red-200/60">
                <div className="flex items-center gap-1.5 font-bold text-[#18181B]">
                  <Globe className="w-3.5 h-3.5 text-[#6D5CE8]" />
                  <span>Authorize &ldquo;{unauthorizedDomainHost}&rdquo; in Firebase:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>Open <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong>.</li>
                  <li>Click <strong>Add domain</strong> and paste <strong>{unauthorizedDomainHost}</strong>.</li>
                </ol>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3 h-3 text-[#18B89A]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy {unauthorizedDomainHost}</span>
                      </>
                    )}
                  </button>
                  <a
                    href={FIREBASE_AUTH_SETTINGS_CONSOLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#6D5CE8] text-white font-semibold text-[11px]"
                  >
                    <span>Open Authorized Domains</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {needsProviderEnableHelp && (
              <div className="pt-2 border-t border-red-200/80 space-y-1.5 text-[11px] text-red-800">
                <p className="font-bold">
                  How to enable Email/Password in Firebase Console (takes 15 seconds):
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Open your Firebase Authentication Providers page below.</li>
                  <li>Click <strong>Email/Password</strong> (and <strong>Google</strong>).</li>
                  <li>Toggle <strong>Enable</strong> and click <strong>Save</strong>.</li>
                </ol>
                <a
                  href={FIREBASE_AUTH_PROVIDERS_CONSOLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#6D5CE8] underline pt-1"
                >
                  <span>Open Firebase Auth Console ({FIREBASE_PROJECT_ID})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-[#18B89A]/10 border border-[#18B89A]/30 text-xs text-[#18181B] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {!user && (
          <>
            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-[#4285F4]/40 bg-gradient-to-b from-[#4285F4]/[0.06] to-white hover:border-[#4285F4] text-xs sm:text-sm font-bold text-[#18181B] shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <span className="font-display font-extrabold text-base tracking-tight">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </span>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Or with Email
              </span>
              <div className="grow border-t border-slate-200" />
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'signin'
                    ? 'bg-white text-[#18181B] shadow-2xs'
                    : 'text-slate-600 hover:text-[#18181B]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'signup'
                    ? 'bg-white text-[#18181B] shadow-2xs'
                    : 'text-slate-600 hover:text-[#18181B]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={120}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                  />
                </div>
              </div>

              {tab !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    {tab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTab('reset');
                          setErrorMsg(null);
                          setInfoMsg(null);
                        }}
                        className="text-[11px] font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? 'Please wait...'
                  : tab === 'signin'
                    ? 'Sign In with Email'
                    : tab === 'signup'
                      ? 'Create Account & Continue'
                      : 'Send Password Reset Email'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
