'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  FileEdit,
  Target,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  validateEmailPasswordInput,
  sanitizeRedirectPath,
  FIREBASE_PROJECT_ID,
  FIREBASE_AUTH_PROVIDERS_CONSOLE_URL,
  FIREBASE_AUTH_SETTINGS_CONSOLE_URL,
  FIREBASE_AUTHORIZED_CONTINUE_URL,
} from '@/lib/firebase';
import { useResume } from '@/context/ResumeContext';

const FEATURE_LABELS: Record<string, string> = {
  '/resume-builder': 'AI Resume Builder Studio',
  '/ats-checker': 'ATS Resume Quality Checker',
  '/job-matcher': 'Job Description Matcher',
  '/dashboard': 'Resume Workspace Dashboard',
  '/templates': 'Designer A4 Resume Templates',
  '/settings': 'Account & Privacy Settings',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthReady, handleRefreshAuthUser } = useResume();

  const rawRedirect = searchParams.get('redirect');
  const redirectPath = sanitizeRedirectPath(rawRedirect, '/resume-builder');
  const targetFeatureName =
    FEATURE_LABELS[redirectPath] || 'Your Resume Workspace';

  const initialMode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [needsProviderEnableHelp, setNeedsProviderEnableHelp] = useState(false);
  const [unauthorizedDomainHost, setUnauthorizedDomainHost] = useState<
    string | null
  >(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Redirect authenticated users immediately to the feature they originally selected
  useEffect(() => {
    if (isAuthReady && user) {
      router.replace(redirectPath);
    }
  }, [isAuthReady, user, redirectPath, router]);

  // Complete any pending OAuth redirect flow
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {
        // Ignore if no redirect was initiated
      });
  }, [redirectPath, router]);

  // Countdown timer for login rate-limiting lockout
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

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

  const checkServerAuthRateLimit = async (
    targetEmail: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.allowed) {
        if (data.retryAfterSeconds) {
          setCooldownSeconds(data.retryAfterSeconds);
        }
        setErrorMsg(
          data.errorMessage ||
            'Too many sign-in attempts. Please wait before trying again.'
        );
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const recordServerAuthAttempt = async (
    targetEmail: string,
    success: boolean
  ) => {
    try {
      const res = await fetch('/api/auth/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record',
          email: targetEmail,
          success,
        }),
      });
      const data = await res.json();
      if (!data.allowed && data.retryAfterSeconds) {
        setCooldownSeconds(data.retryAfterSeconds);
      }
    } catch {
      // Ignore network errors
    }
  };

  const handleGoogleSignIn = async () => {
    if (cooldownSeconds > 0) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsProviderEnableHelp(false);
    setUnauthorizedDomainHost(null);

    const allowed = await checkServerAuthRateLimit('google-oauth');
    if (!allowed) return;

    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await recordServerAuthAttempt('google-oauth', true);
      router.replace(redirectPath);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const message = err instanceof Error ? err.message : String(err);

      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          // Fall through to error handling
        }
      }

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
        await recordServerAuthAttempt('google-oauth', false);
        setErrorMsg(message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsProviderEnableHelp(false);
    setUnauthorizedDomainHost(null);

    const cleanEmail = email.trim();

    if (tab === 'reset') {
      const check = validateEmailPasswordInput(cleanEmail);
      if (!check.valid) {
        setErrorMsg(check.error || 'Please enter a valid email address.');
        return;
      }
      const allowed = await checkServerAuthRateLimit(cleanEmail);
      if (!allowed) return;

      setLoading(true);
      try {
        try {
          await sendPasswordResetEmail(auth, cleanEmail, {
            url: FIREBASE_AUTHORIZED_CONTINUE_URL,
          });
        } catch {
          await sendPasswordResetEmail(auth, cleanEmail);
        }
        await recordServerAuthAttempt(cleanEmail, false);
        setInfoMsg(
          'Password reset link sent! Please check your email inbox and spam folder.'
        );
      } catch (err: unknown) {
        await recordServerAuthAttempt(cleanEmail, false);
        setErrorMsg(
          err instanceof Error ? err.message : 'Could not send reset email.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = validateEmailPasswordInput(
      cleanEmail,
      password,
      tab === 'signup' ? displayName : undefined
    );
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please check your input fields.');
      return;
    }

    const allowed = await checkServerAuthRateLimit(cleanEmail);
    if (!allowed) return;

    setLoading(true);
    try {
      if (tab === 'signup') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
        if (displayName.trim()) {
          await updateProfile(cred.user, {
            displayName: displayName.trim().slice(0, 120),
          });
        }
        // Always pass the default Firebase authDomain as continueUrl so custom domains (like Vercel)
        // never fail verification email dispatch with auth/unauthorized-domain
        try {
          await sendEmailVerification(cred.user, {
            url: FIREBASE_AUTHORIZED_CONTINUE_URL,
          });
        } catch {
          // Non-blocking verification email dispatch
        }
        await handleRefreshAuthUser();
        await recordServerAuthAttempt(cleanEmail, true);
        router.replace(redirectPath);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        await recordServerAuthAttempt(cleanEmail, true);
        router.replace(redirectPath);
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
        await recordServerAuthAttempt(cleanEmail, false);
        setErrorMsg('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg(
          'An account with this email already exists. Switch to Sign In.'
        );
      } else if (code === 'auth/too-many-requests') {
        setCooldownSeconds(60);
        setErrorMsg(
          'Too many failed attempts detected by Firebase Auth. Please wait 60 seconds or reset your password.'
        );
      } else {
        await recordServerAuthAttempt(cleanEmail, false);
        setErrorMsg(message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Value Proposition & Selected Destination */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#6D5CE8]/10 border border-[#6D5CE8]/20 text-xs font-bold text-[#6D5CE8]">
            <ShieldCheck className="w-4 h-4" />
            <span>Private &amp; Secure Cloud Resume Studio</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#18181B]">
              Sign In or Create an Account to Continue to{' '}
              <span className="text-[#6D5CE8]">{targetFeatureName}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Your resumes and personal information are stored privately under your authenticated Firebase UID in Cloud Firestore (<strong>{FIREBASE_PROJECT_ID}</strong>). You stay signed in across visits and only you can access your data.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center shrink-0">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#18181B]">
                  100% Private, Owner-Isolated Resumes
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Strict zero-trust Firestore Security Rules ensure no other user can ever read, edit, or delete your resumes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18B89A]/10 text-[#18B89A] flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#18181B]">
                  Persistent Session &amp; Instant Redirect
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sign in once with Google or Email/Password—we keep you logged in and take you straight to{' '}
                  <span className="font-mono font-semibold text-[#6D5CE8]">
                    {redirectPath}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#18181B]"
            >
              <span>← Back to public landing page</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Sign In / Create Account Card */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6D5CE8]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Firebase Auth · {FIREBASE_PROJECT_ID}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Next: {redirectPath}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#18181B]">
                {tab === 'signin'
                  ? 'Welcome Back — Sign In'
                  : tab === 'signup'
                    ? 'Create Your Free Account'
                    : 'Reset Your Password'}
              </h2>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>

                {unauthorizedDomainHost && (
                  <div className="pt-2.5 border-t border-red-200/80 space-y-2.5 text-[11px] text-slate-800 bg-white/90 p-3 rounded-xl border border-red-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-[#18181B]">
                      <Globe className="w-3.5 h-3.5 text-[#6D5CE8]" />
                      <span>
                        How to Authorize &ldquo;{unauthorizedDomainHost}&rdquo; for Google Sign-In (10 sec):
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>
                        Copy your domain below:{' '}
                        <code className="font-mono font-bold text-[#18181B] bg-slate-100 px-1.5 py-0.5 rounded">
                          {unauthorizedDomainHost}
                        </code>
                      </li>
                      <li>
                        In Firebase Console, open <strong>Authentication</strong> &rarr; <strong>Settings</strong> tab &rarr; <strong>Authorized domains</strong>.
                      </li>
                      <li>
                        Click <strong>Add domain</strong>, paste{' '}
                        <strong>{unauthorizedDomainHost}</strong>, and click <strong>Add</strong>.
                      </li>
                    </ol>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] cursor-pointer"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3 h-3 text-[#18B89A]" />
                            <span>Copied {unauthorizedDomainHost}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Domain</span>
                          </>
                        )}
                      </button>
                      <a
                        href={FIREBASE_AUTH_SETTINGS_CONSOLE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white font-semibold text-[11px]"
                      >
                        <span>Open Authorized Domains Settings</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] font-semibold text-[#18B89A] pt-0.5">
                      ✓ Tip: Email &amp; Password account creation below works immediately even before adding the domain!
                    </p>
                  </div>
                )}

                {needsProviderEnableHelp && (
                  <div className="pt-2 border-t border-red-200/80 space-y-1.5 text-[11px] text-red-800">
                    <p className="font-bold">
                      Enable Sign-In Providers in Firebase Console:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Open your Firebase Authentication Providers page below.</li>
                      <li>Enable <strong>Google</strong> and <strong>Email/Password</strong> and click Save.</li>
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

            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={loading || cooldownSeconds > 0}
              onClick={handleGoogleSignIn}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border-2 border-[#4285F4]/40 bg-gradient-to-b from-[#4285F4]/[0.06] to-white hover:border-[#4285F4] text-xs sm:text-sm font-bold text-[#18181B] shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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

            <div className="relative flex py-0.5 items-center">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Or with Email &amp; Password
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
                <span>Sign Up</span>
              </button>
            </div>

            {/* Email/Password Form */}
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
                disabled={loading || cooldownSeconds > 0}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cooldownSeconds > 0 ? (
                  <span>Rate Limited — Retry in {cooldownSeconds}s</span>
                ) : loading ? (
                  <span>Authenticating...</span>
                ) : tab === 'signin' ? (
                  <>
                    <span>Sign In &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : tab === 'signup' ? (
                  <>
                    <span>Create Account &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Send Password Reset Email</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 bg-[#F8FAFC] flex items-center justify-center p-8">
          <div className="text-xs font-semibold text-slate-500">
            Loading secure sign-in...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
