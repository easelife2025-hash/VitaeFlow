'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  ResumeDraft,
  TemplateId,
  ResumeFontFamily,
  resolveResumeColors,
} from '@/lib/types';

const resolvedFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    firebaseConfig.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    firebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ||
    firebaseConfig.firestoreDatabaseId,
};

// Initialize Firebase App singleton
const app =
  getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);

// CRITICAL: Pass firestoreDatabaseId from resolved config
export const db = getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Keep users logged in across browser restarts (Persistent Login)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Fallback to default persistence if storage is restricted
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_PROJECT_ID = resolvedFirebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = resolvedFirebaseConfig.firestoreDatabaseId;
export const FIREBASE_QUOTA_UPGRADE_URL = `https://console.firebase.google.com/project/${resolvedFirebaseConfig.projectId}/firestore/databases/${resolvedFirebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
export const FIREBASE_PRICING_URL =
  'https://firebase.google.com/pricing#cloud-firestore';
export const FIREBASE_AUTH_PROVIDERS_CONSOLE_URL = `https://console.firebase.google.com/project/${resolvedFirebaseConfig.projectId}/authentication/providers`;
export const FIREBASE_AUTH_SETTINGS_CONSOLE_URL = `https://console.firebase.google.com/project/${resolvedFirebaseConfig.projectId}/authentication/settings`;
export const FIREBASE_AUTHORIZED_CONTINUE_URL = `https://${resolvedFirebaseConfig.authDomain}`;

/**
 * Validates and sanitizes internal redirect paths to prevent open-redirect vulnerabilities
 * while ensuring users return to the exact protected feature they selected.
 */
export function sanitizeRedirectPath(
  rawPath: string | null | undefined,
  fallback = '/resume-builder'
): string {
  if (!rawPath || typeof rawPath !== 'string') return fallback;
  const trimmed = rawPath.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/login')
  ) {
    return fallback;
  }
  return trimmed.slice(0, 200);
}

/**
 * Performs an authenticated fetch to protected server API routes by attaching
 * the current user's Firebase ID token (`Authorization: Bearer <idToken>`) and
 * automatically refreshing expired tokens once on 401 responses.
 */
export async function authenticatedFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const currentUser = auth.currentUser;
  const headers = new Headers(init.headers || {});

  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken(false);
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
    } catch {
      // Proceed and let server return 401 if token retrieval failed
    }
  }

  let res = await fetch(url, {
    ...init,
    headers,
  });

  // Handle expired token by forcing a fresh ID token once
  if (res.status === 401 && auth.currentUser) {
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      if (freshToken) {
        headers.set('Authorization', `Bearer ${freshToken}`);
        res = await fetch(url, {
          ...init,
          headers,
        });
      }
    } catch {
      // Return original 401 response
    }
  }

  return res;
}

// ============================================================================
// Blueprint Validation Constants (Synced verbatim with firebase-blueprint.json)
// ============================================================================
export const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_DISPLAY_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_RESUME_TITLE_LENGTH = 200;
export const MAX_TARGET_ROLE_LENGTH = 200;
export const MAX_ACCENT_COLOR_LENGTH = 32;
export const MAX_JD_DRAFT_LENGTH = 15000;
export const MAX_EXPERIENCE_ITEMS = 30;
export const MAX_EDUCATION_ITEMS = 20;
export const MAX_SKILLS_ITEMS = 100;
export const MAX_PROJECTS_ITEMS = 25;
export const MAX_CERTIFICATIONS_ITEMS = 25;
export const MAX_LANGUAGES_ITEMS = 20;

const ALLOWED_TEMPLATES: TemplateId[] = [
  'modern-violet',
  'executive-minimal',
  'teal-split',
  'creative-studio',
  'professional-ats',
  'elegant-editorial',
];

const ALLOWED_FONTS: ResumeFontFamily[] = [
  'inter',
  'lato',
  'roboto',
  'playfair',
];

// ============================================================================
// Standard Firestore Error Handling & Quota Detection
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isQuotaExceededError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('Quota exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('Free daily read units per project')
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// Boot-time Connection Test (getDocFromServer)
// ============================================================================
let hasTestedConnection = false;

export async function testFirestoreConnection(): Promise<{
  online: boolean;
  quotaExceeded: boolean;
  errorMessage?: string;
}> {
  if (typeof window === 'undefined') {
    return { online: true, quotaExceeded: false };
  }
  if (hasTestedConnection) {
    return { online: true, quotaExceeded: false };
  }
  hasTestedConnection = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { online: true, quotaExceeded: false };
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return {
        online: true,
        quotaExceeded: true,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
      return {
        online: false,
        quotaExceeded: false,
        errorMessage: 'Please check your Firebase configuration.',
      };
    }
    // Permission denied on /test/connection is expected because of default-deny rules, which confirms online reachability
    return { online: true, quotaExceeded: false };
  }
}

if (typeof window !== 'undefined') {
  testFirestoreConnection();
}

// ============================================================================
// Defensive Payload Validation & Sanitization
// ============================================================================
export function sanitizeDocumentId(rawId: string, fallbackPrefix = 'doc'): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, MAX_ID_LENGTH);
  if (cleaned.length >= 1 && VALID_ID_REGEX.test(cleaned)) {
    return cleaned;
  }
  return `${fallbackPrefix}-${Date.now()}`;
}

export function validateEmailPasswordInput(
  email: string,
  password?: string,
  displayName?: string
): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (
    trimmedEmail.length < 3 ||
    trimmedEmail.length > MAX_EMAIL_LENGTH ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  ) {
    return {
      valid: false,
      error: 'Please enter a valid email address (3–254 characters).',
    };
  }
  if (password !== undefined && password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long.',
    };
  }
  if (
    displayName !== undefined &&
    displayName.trim().length > MAX_DISPLAY_NAME_LENGTH
  ) {
    return {
      valid: false,
      error: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`,
    };
  }
  return { valid: true };
}

export function buildValidatedUserProfilePayload(
  params: {
    uid: string;
    displayName: string;
    email: string;
    defaultTemplateId: TemplateId;
    defaultAccentColor: string;
    defaultCompactMode: boolean;
    defaultFontFamily?: ResumeFontFamily;
  },
  isCreate: boolean
) {
  const safeUid = sanitizeDocumentId(params.uid, 'user');
  const safeDisplayName = String(params.displayName || 'VitaeFlow User')
    .trim()
    .slice(0, MAX_DISPLAY_NAME_LENGTH);
  const safeEmail = String(params.email || 'user@example.com')
    .trim()
    .slice(0, MAX_EMAIL_LENGTH);
  const safeTemplate: TemplateId = ALLOWED_TEMPLATES.includes(
    params.defaultTemplateId
  )
    ? params.defaultTemplateId
    : 'modern-violet';
  const rawAccent = String(params.defaultAccentColor || '').trim();
  const safeAccent =
    rawAccent.length >= 4 && rawAccent.length <= MAX_ACCENT_COLOR_LENGTH
      ? rawAccent
      : '#6D5CE8';
  const safeFont: ResumeFontFamily =
    params.defaultFontFamily && ALLOWED_FONTS.includes(params.defaultFontFamily)
      ? params.defaultFontFamily
      : 'inter';

  if (isCreate) {
    return {
      uid: safeUid,
      displayName: safeDisplayName,
      email: safeEmail,
      defaultTemplateId: safeTemplate,
      defaultAccentColor: safeAccent,
      defaultCompactMode: Boolean(params.defaultCompactMode),
      defaultFontFamily: safeFont,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  return {
    displayName: safeDisplayName,
    email: safeEmail,
    defaultTemplateId: safeTemplate,
    defaultAccentColor: safeAccent,
    defaultCompactMode: Boolean(params.defaultCompactMode),
    defaultFontFamily: safeFont,
    updatedAt: serverTimestamp(),
  };
}

export function buildValidatedResumePayload(
  draft: ResumeDraft,
  ownerUid: string,
  isCreate: boolean
) {
  const safeOwnerId = sanitizeDocumentId(ownerUid, 'user');
  const safeDocId = sanitizeDocumentId(
    `${safeOwnerId}_${draft.id}`,
    'resume'
  );
  const resolvedColors = resolveResumeColors(draft);
  const safeTemplate: TemplateId = ALLOWED_TEMPLATES.includes(draft.templateId)
    ? draft.templateId
    : 'modern-violet';
  const safeFont: ResumeFontFamily =
    draft.fontFamily && ALLOWED_FONTS.includes(draft.fontFamily)
      ? draft.fontFamily
      : 'inter';
  const rawDraftAccent = String(draft.accentColor || '').trim();
  const safeAccent =
    rawDraftAccent.length >= 4 &&
    rawDraftAccent.length <= MAX_ACCENT_COLOR_LENGTH
      ? rawDraftAccent
      : '#6D5CE8';
  const safeTitle =
    String(draft.title || 'Untitled Resume')
      .trim()
      .slice(0, MAX_RESUME_TITLE_LENGTH) || 'Untitled Resume';
  const safeTargetRole = String(
    draft.targetRole || draft.personalInfo?.jobTitle || ''
  )
    .trim()
    .slice(0, MAX_TARGET_ROLE_LENGTH);

  // Do not store base64 photos or large blobs in Firestore (1MB document limit & no Firebase Storage)
  const personalInfo = {
    fullName: String(draft.personalInfo?.fullName || '').slice(0, 160),
    jobTitle: String(draft.personalInfo?.jobTitle || '').slice(0, 160),
    email: String(draft.personalInfo?.email || '').slice(0, 254),
    phone: String(draft.personalInfo?.phone || '').slice(0, 64),
    location: String(draft.personalInfo?.location || '').slice(0, 160),
    website: String(draft.personalInfo?.website || '').slice(0, 300),
    linkedin: String(draft.personalInfo?.linkedin || '').slice(0, 300),
    summary: String(draft.personalInfo?.summary || '').slice(0, 4000),
    photoShape: draft.personalInfo?.photoShape || 'circle',
    photoZoom: Number(draft.personalInfo?.photoZoom ?? 1),
    photoOffsetX: Number(draft.personalInfo?.photoOffsetX ?? 0),
    photoOffsetY: Number(draft.personalInfo?.photoOffsetY ?? 0),
  };

  const customColors: {
    primary: string;
    accent: string;
    heading: string;
    paletteId?: string;
  } = {
    primary: String(resolvedColors.primary || '#6D5CE8').slice(0, 32),
    accent: String(resolvedColors.accent || '#18B89A').slice(0, 32),
    heading: String(resolvedColors.heading || '#18181B').slice(0, 32),
    ...(resolvedColors.paletteId
      ? { paletteId: String(resolvedColors.paletteId).slice(0, 40) }
      : {}),
  };

  const experience = (draft.experience || [])
    .slice(0, MAX_EXPERIENCE_ITEMS)
    .map((exp, i) => ({
      id: sanitizeDocumentId(exp.id || `exp-${i}`),
      company: String(exp.company || '').slice(0, 160),
      role: String(exp.role || '').slice(0, 160),
      location: String(exp.location || '').slice(0, 160),
      startDate: String(exp.startDate || '').slice(0, 60),
      endDate: String(exp.endDate || '').slice(0, 60),
      current: Boolean(exp.current),
      bullets: (exp.bullets || [])
        .slice(0, 20)
        .map((b) => String(b || '').slice(0, 600)),
    }));

  const education = (draft.education || [])
    .slice(0, MAX_EDUCATION_ITEMS)
    .map((edu, i) => ({
      id: sanitizeDocumentId(edu.id || `edu-${i}`),
      institution: String(edu.institution || '').slice(0, 160),
      degree: String(edu.degree || '').slice(0, 160),
      field: String(edu.field || '').slice(0, 160),
      location: String(edu.location || '').slice(0, 160),
      startDate: String(edu.startDate || '').slice(0, 60),
      endDate: String(edu.endDate || '').slice(0, 60),
      gpa: String(edu.gpa || '').slice(0, 40),
    }));

  const skills = (draft.skills || [])
    .map((s) => String(s || '').trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, MAX_SKILLS_ITEMS);

  const projects = (draft.projects || [])
    .slice(0, MAX_PROJECTS_ITEMS)
    .map((proj, i) => ({
      id: sanitizeDocumentId(proj.id || `proj-${i}`),
      name: String(proj.name || '').slice(0, 160),
      subtitle: String(proj.subtitle || '').slice(0, 200),
      link: String(proj.link || '').slice(0, 300),
      bullets: (proj.bullets || [])
        .slice(0, 15)
        .map((b) => String(b || '').slice(0, 600)),
    }));

  const certifications = (draft.certifications || [])
    .slice(0, MAX_CERTIFICATIONS_ITEMS)
    .map((cert, i) => ({
      id: sanitizeDocumentId(cert.id || `cert-${i}`),
      name: String(cert.name || '').slice(0, 160),
      issuer: String(cert.issuer || '').slice(0, 160),
      date: String(cert.date || '').slice(0, 60),
      credentialId: String(cert.credentialId || '').slice(0, 120),
    }));

  const languages = (draft.languages || [])
    .slice(0, MAX_LANGUAGES_ITEMS)
    .map((lang, i) => ({
      id: sanitizeDocumentId(lang.id || `lang-${i}`),
      language: String(lang.language || '').slice(0, 100),
      proficiency: lang.proficiency || 'Full Professional',
    }));

  const jobDescriptionDraft = String(draft.jobDescriptionDraft || '').slice(
    0,
    MAX_JD_DRAFT_LENGTH
  );

  const mutableFields = {
    title: safeTitle,
    targetRole: safeTargetRole,
    templateId: safeTemplate,
    accentColor: safeAccent,
    compactMode: Boolean(draft.compactMode),
    fontFamily: safeFont,
    decorativeHeading: Boolean(draft.decorativeHeading),
    customColors,
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    jobDescriptionDraft,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    return {
      docId: safeDocId,
      data: {
        id: safeDocId,
        ownerId: safeOwnerId,
        ...mutableFields,
        createdAt: serverTimestamp(),
      },
    };
  }

  return {
    docId: safeDocId,
    data: mutableFields,
  };
}

export function firestoreDocToResumeDraft(
  docId: string,
  data: Record<string, unknown>
): ResumeDraft {
  const updatedAtRaw = data.updatedAt;
  let updatedAtIso = new Date().toISOString();
  if (updatedAtRaw instanceof Timestamp) {
    updatedAtIso = updatedAtRaw.toDate().toISOString();
  } else if (typeof updatedAtRaw === 'string') {
    updatedAtIso = updatedAtRaw;
  }

  const ownerPrefix = typeof data.ownerId === 'string' ? `${data.ownerId}_` : '';
  const localId =
    ownerPrefix && docId.startsWith(ownerPrefix)
      ? docId.slice(ownerPrefix.length)
      : docId;

  return {
    id: localId || docId,
    title: String(data.title || 'Untitled Resume'),
    targetRole: String(data.targetRole || ''),
    updatedAt: updatedAtIso,
    templateId: (data.templateId as TemplateId) || 'modern-violet',
    accentColor: String(data.accentColor || '#6D5CE8'),
    compactMode: Boolean(data.compactMode),
    fontFamily: (data.fontFamily as ResumeFontFamily) || 'inter',
    decorativeHeading: Boolean(data.decorativeHeading),
    customColors: data.customColors as ResumeDraft['customColors'],
    personalInfo: (data.personalInfo as ResumeDraft['personalInfo']) || {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      summary: '',
    },
    experience: (data.experience as ResumeDraft['experience']) || [],
    education: (data.education as ResumeDraft['education']) || [],
    skills: (data.skills as string[]) || [],
    projects: (data.projects as ResumeDraft['projects']) || [],
    certifications:
      (data.certifications as ResumeDraft['certifications']) || [],
    languages: (data.languages as ResumeDraft['languages']) || [],
    jobDescriptionDraft: String(data.jobDescriptionDraft || ''),
  };
}
