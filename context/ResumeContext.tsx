'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  deleteUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  ResumeDraft,
  TemplateId,
  AccentColor,
  ResumeFontFamily,
  CustomColors,
  AiEnhancerMode,
  AiUsageMetadata,
  EditorSectionId,
  resolveResumeColors,
} from '@/lib/types';
import { SAMPLE_RESUMES, createBlankResume } from '@/lib/sample-data';
import { downloadResumePdf } from '@/lib/pdf-export';
import AiBulletModal from '@/components/AiBulletModal';
import AiFullResumePolishModal from '@/components/AiFullResumePolishModal';
import ImportResumeModal from '@/components/ImportResumeModal';
import DraftsModal from '@/components/DraftsModal';
import AuthModal from '@/components/AuthModal';
import { createResumeContextSnapshot } from '@/lib/ai-fallback';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  isQuotaExceededError,
  buildValidatedUserProfilePayload,
  buildValidatedResumePayload,
  firestoreDocToResumeDraft,
  sanitizeDocumentId,
} from '@/lib/firebase';

const getUserStorageKey = (uid: string) =>
  `vitaeflow_resumes_v2_${sanitizeDocumentId(uid, 'user')}`;
const getUserPrefsKey = (uid: string) =>
  `vitaeflow_prefs_v1_${sanitizeDocumentId(uid, 'user')}`;
const ROUTE_LOCK_KEY = 'vitaeflow_route_lock_v1';

export interface UserPreferences {
  defaultTemplateId: TemplateId;
  defaultAccentColor: AccentColor;
  defaultCompactMode: boolean;
  defaultFontFamily?: ResumeFontFamily;
}

const DEFAULT_PREFS: UserPreferences = {
  defaultTemplateId: 'modern-violet',
  defaultAccentColor: '#6D5CE8',
  defaultCompactMode: false,
  defaultFontFamily: 'inter',
};

interface AiModalOpenConfig {
  initialText: string;
  roleTitle: string;
  companyName?: string;
  mode?: AiEnhancerMode;
  onApply: (newText: string) => void;
}

interface ResumeContextValue {
  drafts: ResumeDraft[];
  activeDraftId: string;
  activeResume: ResumeDraft;
  hasLoadedStorage: boolean;
  preferences: UserPreferences;
  targetEditorSection: EditorSectionId;
  setTargetEditorSection: (sec: EditorSectionId) => void;
  setActiveDraftId: (id: string) => void;
  handleUpdateActiveResume: (updated: ResumeDraft) => void;
  handleUpdateTemplate: (templateId: TemplateId) => void;
  handleUpdateAccent: (accentColor: AccentColor) => void;
  handleUpdateCustomColors: (colors: Partial<CustomColors>) => void;
  handleUpdateFontFamily: (fontFamily: ResumeFontFamily) => void;
  handleUpdateDecorativeHeading: (enabled: boolean) => void;
  handleCreateBlankDraft: (title?: string) => ResumeDraft;
  handleImportResumeSuccess: (importedDraft: ResumeDraft) => void;
  handleDuplicateDraft: (id: string) => void;
  handleRenameDraft: (id: string, newTitle: string) => void;
  handleDeleteDraft: (id: string) => void;
  handleSelectExampleResume: (exampleDraft: ResumeDraft) => void;
  handleExportPdf: (draftOverride?: ResumeDraft) => void;
  handleUpdatePreferences: (next: Partial<UserPreferences>) => void;
  handleExportAllJsonBackup: () => void;
  handleRestoreJsonBackup: (rawJson: string) => {
    ok: boolean;
    count: number;
    error?: string;
  };
  handleResetToSampleResumes: () => void;
  handleClearLocalStorage: () => void;
  aiUsage: AiUsageMetadata;
  customAiLimit: number;
  setAiUsage: React.Dispatch<React.SetStateAction<AiUsageMetadata>>;
  handleChangeCustomAiLimit: (newLimit: number) => void;
  handleResetAiQuota: () => void;
  openDefaultAiEnhancer: () => void;
  openAiEnhancer: (cfg: AiModalOpenConfig) => void;
  openFullResumePolishModal: () => void;
  openImportModal: () => void;
  openDraftsModal: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  // Firebase Authentication & Cloud Firestore State
  user: User | null;
  isAuthReady: boolean;
  isCloudSyncing: boolean;
  lastCloudSyncedAt: string | null;
  cloudQuotaExceeded: boolean;
  dismissQuotaBanner: () => void;
  isProtectedRouteEnforced: boolean;
  setIsProtectedRouteEnforced: (val: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  handleRefreshAuthUser: () => Promise<void>;
  handleSaveAllDraftsToCloud: (draftsOverride?: ResumeDraft[]) => Promise<boolean>;
  handleReloadResumesFromCloud: () => Promise<boolean>;
  handleSignOut: () => Promise<void>;
  handleDeleteAccountAndData: () => Promise<{ ok: boolean; error?: string }>;
}

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<ResumeDraft[]>(SAMPLE_RESUMES);
  const [activeDraftId, setActiveDraftId] = useState<string>(
    SAMPLE_RESUMES[0].id
  );
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFS);
  const [targetEditorSection, setTargetEditorSection] =
    useState<EditorSectionId>('personal');
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFullPolishModalOpen, setIsFullPolishModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  // Firebase Auth & Cloud Firestore State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncedAt, setLastCloudSyncedAt] = useState<string | null>(
    null
  );
  const [cloudQuotaExceeded, setCloudQuotaExceeded] = useState<boolean>(false);
  const [isProtectedRouteEnforced, setIsProtectedRouteEnforcedState] =
    useState<boolean>(true);

  const draftsRef = useRef<ResumeDraft[]>(drafts);
  draftsRef.current = drafts;
  const prefsRef = useRef<UserPreferences>(preferences);
  prefsRef.current = preferences;

  // Navigation Sidebar & Mobile Drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Configurable AI Usage Quota State
  const [customAiLimit, setCustomAiLimit] = useState<number>(50);
  const [aiUsage, setAiUsage] = useState<AiUsageMetadata>({
    used: 0,
    limit: 50,
    remaining: 50,
    resetAt: '2026-11-04T00:00:00.000Z',
    activeModel: 'gemini-3.8-flash',
    activeModelLabel: 'Gemini 3.8 Flash',
    autoSwitchEnabled: true,
  });

  // AI Bullet & Wording Modal State
  const [aiModalConfig, setAiModalConfig] = useState<{
    isOpen: boolean;
    initialText: string;
    roleTitle: string;
    companyName?: string;
    mode?: AiEnhancerMode;
    onApply: (newText: string) => void;
  }>({
    isOpen: false,
    initialText: '',
    roleTitle: '',
    mode: 'rewrite_bullet',
    onApply: () => {},
  });

  // Load route lock setting on mount (never load shared unauthenticated resumes)
  useEffect(() => {
    try {
      // Remove any legacy shared storage key so resume storage is strictly per-UID
      window.localStorage.removeItem('vitaeflow_resumes_v2');
      window.localStorage.removeItem('vitaeflow_prefs_v1');
      const rawLock = window.localStorage.getItem(ROUTE_LOCK_KEY);
      if (rawLock === 'false') {
        setIsProtectedRouteEnforcedState(false);
      } else {
        setIsProtectedRouteEnforcedState(true);
      }
    } catch {
      // Ignore
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  const setIsProtectedRouteEnforced = (val: boolean) => {
    setIsProtectedRouteEnforcedState(val);
    try {
      window.localStorage.setItem(ROUTE_LOCK_KEY, String(val));
    } catch {
      // Ignore
    }
  };

  // Save drafts ONLY to the authenticated user's UID-isolated localStorage cache
  useEffect(() => {
    if (!hasLoadedStorage || !user) return;
    try {
      window.localStorage.setItem(
        getUserStorageKey(user.uid),
        JSON.stringify(drafts)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [drafts, hasLoadedStorage, user]);

  // Save preferences ONLY to the authenticated user's UID-isolated localStorage cache
  useEffect(() => {
    if (!hasLoadedStorage || !user) return;
    try {
      window.localStorage.setItem(
        getUserPrefsKey(user.uid),
        JSON.stringify(preferences)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [preferences, hasLoadedStorage, user]);

  // Helper: Ensure /users/{uid} exists in Firestore before writing /resumes
  const ensureUserProfileDoc = useCallback(async (currentUser: User) => {
    const safeUid = sanitizeDocumentId(currentUser.uid, 'user');
    const userPath = `users/${safeUid}`;
    const userRef = doc(db, 'users', safeUid);

    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const createPayload = buildValidatedUserProfilePayload(
          {
            uid: safeUid,
            displayName:
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'VitaeFlow User',
            email: currentUser.email || 'user@example.com',
            defaultTemplateId: prefsRef.current.defaultTemplateId,
            defaultAccentColor: prefsRef.current.defaultAccentColor,
            defaultCompactMode: prefsRef.current.defaultCompactMode,
            defaultFontFamily: prefsRef.current.defaultFontFamily,
          },
          true
        );
        await setDoc(userRef, createPayload);
      } else {
        const data = snap.data();
        if (data) {
          setPreferences((prev) => ({
            defaultTemplateId:
              (data.defaultTemplateId as TemplateId) || prev.defaultTemplateId,
            defaultAccentColor:
              (data.defaultAccentColor as AccentColor) ||
              prev.defaultAccentColor,
            defaultCompactMode:
              typeof data.defaultCompactMode === 'boolean'
                ? data.defaultCompactMode
                : prev.defaultCompactMode,
            defaultFontFamily:
              (data.defaultFontFamily as ResumeFontFamily) ||
              prev.defaultFontFamily,
          }));
        }
      }
    } catch (error) {
      if (isQuotaExceededError(error)) {
        setCloudQuotaExceeded(true);
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }, []);

  // Save a single ResumeDraft to Firestore (/resumes/{docId})
  const upsertResumeDraftToCloud = useCallback(
    async (draft: ResumeDraft, currentUser: User) => {
      await ensureUserProfileDoc(currentUser);

      const safeUid = sanitizeDocumentId(currentUser.uid, 'user');
      const docId = sanitizeDocumentId(`${safeUid}_${draft.id}`, 'resume');
      const resumePath = `resumes/${docId}`;
      const resumeRef = doc(db, 'resumes', docId);

      try {
        const snap = await getDoc(resumeRef);
        if (!snap.exists()) {
          const { data } = buildValidatedResumePayload(draft, safeUid, true);
          await setDoc(resumeRef, data);
        } else {
          const { data } = buildValidatedResumePayload(draft, safeUid, false);
          await updateDoc(resumeRef, data);
        }
        setLastCloudSyncedAt(new Date().toISOString());
      } catch (error) {
        if (isQuotaExceededError(error)) {
          setCloudQuotaExceeded(true);
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, resumePath);
      }
    },
    [ensureUserProfileDoc]
  );

  // Save all drafts to Cloud Firestore
  const handleSaveAllDraftsToCloud = useCallback(
    async (draftsOverride?: ResumeDraft[]): Promise<boolean> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const listToSave = draftsOverride || draftsRef.current;
      setIsCloudSyncing(true);
      try {
        await ensureUserProfileDoc(currentUser);
        for (const d of listToSave) {
          await upsertResumeDraftToCloud(d, currentUser);
        }
        setLastCloudSyncedAt(new Date().toISOString());
        return true;
      } catch {
        return false;
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [ensureUserProfileDoc, upsertResumeDraftToCloud]
  );

  // Reload resumes from Cloud Firestore
  const handleReloadResumesFromCloud = useCallback(async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    const safeUid = sanitizeDocumentId(currentUser.uid, 'user');
    setIsCloudSyncing(true);
    try {
      const q = query(
        collection(db, 'resumes'),
        where('ownerId', '==', safeUid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cloudDrafts = snap.docs.map((docSnap) =>
          firestoreDocToResumeDraft(docSnap.id, docSnap.data())
        );
        setDrafts(cloudDrafts);
        setActiveDraftId(cloudDrafts[0].id);
        setLastCloudSyncedAt(new Date().toISOString());
        return true;
      } else {
        // Seed initial local drafts into user's Firestore account
        await handleSaveAllDraftsToCloud(draftsRef.current);
        return true;
      }
    } catch (error) {
      if (isQuotaExceededError(error)) {
        setCloudQuotaExceeded(true);
        return false;
      }
      handleFirestoreError(error, OperationType.LIST, 'resumes');
    } finally {
      setIsCloudSyncing(false);
    }
  }, [handleSaveAllDraftsToCloud]);

  // Listen to Firebase Auth state & attach real-time onSnapshot listener when authenticated
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        // 1. Load this user's UID-isolated local cache first if available
        try {
          const rawUserDrafts = window.localStorage.getItem(
            getUserStorageKey(firebaseUser.uid)
          );
          if (rawUserDrafts) {
            const parsedUserDrafts = JSON.parse(rawUserDrafts);
            if (Array.isArray(parsedUserDrafts) && parsedUserDrafts.length > 0) {
              setDrafts(parsedUserDrafts);
              setActiveDraftId(parsedUserDrafts[0].id);
            }
          }
          const rawUserPrefs = window.localStorage.getItem(
            getUserPrefsKey(firebaseUser.uid)
          );
          if (rawUserPrefs) {
            const parsedUserPrefs = JSON.parse(rawUserPrefs);
            if (parsedUserPrefs && typeof parsedUserPrefs === 'object') {
              setPreferences((prev) => ({ ...prev, ...parsedUserPrefs }));
            }
          }
        } catch {
          // Ignore local cache parse errors
        }

        const safeUid = sanitizeDocumentId(firebaseUser.uid, 'user');
        await ensureUserProfileDoc(firebaseUser);

        const q = query(
          collection(db, 'resumes'),
          where('ownerId', '==', safeUid)
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          async (snapshot) => {
            if (!snapshot.empty) {
              const cloudDrafts = snapshot.docs.map((docSnap) =>
                firestoreDocToResumeDraft(docSnap.id, docSnap.data())
              );
              setDrafts(cloudDrafts);
              setActiveDraftId((prevId) =>
                cloudDrafts.some((d) => d.id === prevId)
                  ? prevId
                  : cloudDrafts[0].id
              );
              setLastCloudSyncedAt(new Date().toISOString());
            } else {
              // Automatically save user's starter drafts to their private cloud account on first login
              await handleSaveAllDraftsToCloud(draftsRef.current);
            }
          },
          (error) => {
            if (isQuotaExceededError(error)) {
              setCloudQuotaExceeded(true);
              return;
            }
            handleFirestoreError(error, OperationType.LIST, 'resumes');
          }
        );
      } else {
        // Clear in-memory drafts back to clean sample templates on sign-out so no user data leaks
        setDrafts(SAMPLE_RESUMES);
        setActiveDraftId(SAMPLE_RESUMES[0].id);
        setPreferences(DEFAULT_PREFS);
        setLastCloudSyncedAt(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [ensureUserProfileDoc, handleSaveAllDraftsToCloud]);

  const handleRefreshAuthUser = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser } as User);
    await ensureUserProfileDoc(auth.currentUser);
    await handleSaveAllDraftsToCloud(draftsRef.current);
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setDrafts(SAMPLE_RESUMES);
    setActiveDraftId(SAMPLE_RESUMES[0].id);
    setPreferences(DEFAULT_PREFS);
    setLastCloudSyncedAt(null);
  };

  const handleDeleteAccountAndData = async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { ok: false, error: 'No authenticated user is signed in.' };
    }

    const safeUid = sanitizeDocumentId(currentUser.uid, 'user');
    setIsCloudSyncing(true);
    try {
      // 1. Delete all owned resume documents in /resumes
      const q = query(
        collection(db, 'resumes'),
        where('ownerId', '==', safeUid)
      );
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        try {
          await deleteDoc(doc(db, 'resumes', docSnap.id));
        } catch (err) {
          if (isQuotaExceededError(err)) {
            setCloudQuotaExceeded(true);
          } else {
            handleFirestoreError(
              err,
              OperationType.DELETE,
              `resumes/${docSnap.id}`
            );
          }
        }
      }

      // 2. Delete user profile document in /users/{uid}
      const userDocRef = doc(db, 'users', safeUid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        try {
          await deleteDoc(userDocRef);
        } catch (err) {
          if (isQuotaExceededError(err)) {
            setCloudQuotaExceeded(true);
          } else {
            handleFirestoreError(err, OperationType.DELETE, `users/${safeUid}`);
          }
        }
      }

      // 3. Clear local browser storage
      handleClearLocalStorage();

      // 4. Delete Firebase Auth User
      await deleteUser(currentUser);
      setUser(null);
      return { ok: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/requires-recent-login') {
        return {
          ok: false,
          error:
            'Your cloud resumes and profile were deleted, but Firebase requires a fresh sign-in before deleting your Auth login. Please sign out, sign back in, and click Delete Account again.',
        };
      }
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to complete account deletion.',
      };
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Fetch initial server-side AI quota status
  const syncAiQuota = useCallback(
    async (limitOverride?: number, reset = false) => {
      const effectiveLimit = limitOverride ?? customAiLimit;
      try {
        const res = await fetch('/api/ai/generate-summary', {
          method: 'GET',
          headers: {
            'x-ai-custom-limit': String(effectiveLimit),
            ...(reset ? { 'x-ai-reset-quota': 'true' } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.usage) {
            setAiUsage(data.usage);
          }
        }
      } catch {
        // Keep local state if offline
      }
    },
    [customAiLimit]
  );

  useEffect(() => {
    syncAiQuota(50, false);
  }, [syncAiQuota]);

  const handleChangeCustomAiLimit = (newLimit: number) => {
    setCustomAiLimit(newLimit);
    setAiUsage((prev) => ({
      ...prev,
      limit: newLimit,
      remaining: Math.max(0, newLimit - prev.used),
    }));
    syncAiQuota(newLimit, false);
  };

  const handleResetAiQuota = () => {
    syncAiQuota(customAiLimit, true);
  };

  const activeResume =
    drafts.find((d) => d.id === activeDraftId) || drafts[0] || SAMPLE_RESUMES[0];

  const handleUpdateActiveResume = (updated: ResumeDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    if (auth.currentUser) {
      void upsertResumeDraftToCloud(updated, auth.currentUser);
    }
  };

  const handleUpdateTemplate = (templateId: TemplateId) => {
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      templateId,
    });
  };

  const handleUpdateAccent = (accentColor: AccentColor) => {
    const currentColors = resolveResumeColors(activeResume);
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      accentColor,
      customColors: {
        ...currentColors,
        primary: accentColor,
      },
    });
  };

  const handleUpdateCustomColors = (patch: Partial<CustomColors>) => {
    const currentColors = resolveResumeColors(activeResume);
    const nextColors: CustomColors = {
      ...currentColors,
      ...patch,
    };
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      accentColor: nextColors.primary,
      customColors: nextColors,
    });
  };

  const handleUpdateFontFamily = (fontFamily: ResumeFontFamily) => {
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      fontFamily,
    });
  };

  const handleUpdateDecorativeHeading = (decorativeHeading: boolean) => {
    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      decorativeHeading,
    });
  };

  const handleCreateBlankDraft = (title?: string): ResumeDraft => {
    const base = createBlankResume(
      title || `New Resume ${drafts.length + 1}`
    );
    const fresh: ResumeDraft = {
      ...base,
      templateId: preferences.defaultTemplateId,
      accentColor: preferences.defaultAccentColor,
      compactMode: preferences.defaultCompactMode,
      fontFamily: preferences.defaultFontFamily || 'inter',
    };
    setDrafts((prev) => [fresh, ...prev]);
    setActiveDraftId(fresh.id);
    setIsDraftsModalOpen(false);
    if (auth.currentUser) {
      void upsertResumeDraftToCloud(fresh, auth.currentUser);
    }
    return fresh;
  };

  const handleImportResumeSuccess = (importedDraft: ResumeDraft) => {
    const styledDraft: ResumeDraft = {
      ...importedDraft,
      templateId: preferences.defaultTemplateId,
      accentColor: preferences.defaultAccentColor,
      fontFamily: preferences.defaultFontFamily || 'inter',
    };
    setDrafts((prev) => [styledDraft, ...prev]);
    setActiveDraftId(styledDraft.id);
    if (auth.currentUser) {
      void upsertResumeDraftToCloud(styledDraft, auth.currentUser);
    }
  };

  const handleDuplicateDraft = (id: string) => {
    const source = drafts.find((d) => d.id === id);
    if (!source) return;
    const copy: ResumeDraft = {
      ...JSON.parse(JSON.stringify(source)),
      id: `draft-${Date.now()}`,
      title: `${source.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setDrafts((prev) => [copy, ...prev]);
    setActiveDraftId(copy.id);
    if (auth.currentUser) {
      void upsertResumeDraftToCloud(copy, auth.currentUser);
    }
  };

  const handleRenameDraft = (id: string, newTitle: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = {
            ...d,
            title: newTitle.slice(0, 200),
            updatedAt: new Date().toISOString(),
          };
          if (auth.currentUser) {
            void upsertResumeDraftToCloud(updated, auth.currentUser);
          }
          return updated;
        }
        return d;
      })
    );
  };

  const handleDeleteDraft = (id: string) => {
    if (drafts.length <= 1) return;
    const remaining = drafts.filter((d) => d.id !== id);
    setDrafts(remaining);
    if (activeDraftId === id) {
      setActiveDraftId(remaining[0].id);
    }
    if (auth.currentUser) {
      const safeUid = sanitizeDocumentId(auth.currentUser.uid, 'user');
      const docId = sanitizeDocumentId(`${safeUid}_${id}`, 'resume');
      const resumePath = `resumes/${docId}`;
      void deleteDoc(doc(db, 'resumes', docId)).catch((err) => {
        if (isQuotaExceededError(err)) {
          setCloudQuotaExceeded(true);
        } else {
          handleFirestoreError(err, OperationType.DELETE, resumePath);
        }
      });
    }
  };

  const handleSelectExampleResume = (exampleDraft: ResumeDraft) => {
    const exists = drafts.some((d) => d.id === exampleDraft.id);
    if (!exists) {
      setDrafts((prev) => [exampleDraft, ...prev]);
      if (auth.currentUser) {
        void upsertResumeDraftToCloud(exampleDraft, auth.currentUser);
      }
    }
    setActiveDraftId(exampleDraft.id);
  };

  const handleExportPdf = (draftOverride?: ResumeDraft) => {
    downloadResumePdf(draftOverride || activeResume);
  };

  const handleUpdatePreferences = (next: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const merged = { ...prev, ...next };
      if (auth.currentUser) {
        const safeUid = sanitizeDocumentId(auth.currentUser.uid, 'user');
        const userRef = doc(db, 'users', safeUid);
        const updatePayload = buildValidatedUserProfilePayload(
          {
            uid: safeUid,
            displayName:
              auth.currentUser.displayName ||
              auth.currentUser.email?.split('@')[0] ||
              'VitaeFlow User',
            email: auth.currentUser.email || 'user@example.com',
            defaultTemplateId: merged.defaultTemplateId,
            defaultAccentColor: merged.defaultAccentColor,
            defaultCompactMode: merged.defaultCompactMode,
            defaultFontFamily: merged.defaultFontFamily,
          },
          false
        );
        void updateDoc(userRef, updatePayload).catch((err) => {
          if (isQuotaExceededError(err)) {
            setCloudQuotaExceeded(true);
          }
        });
      }
      return merged;
    });
  };

  const handleExportAllJsonBackup = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      owner: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }
        : null,
      preferences,
      drafts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitaeflow-resumes-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreJsonBackup = (
    rawJson: string
  ): { ok: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(rawJson);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.drafts)
          ? parsed.drafts
          : parsed?.personalInfo
            ? [parsed]
            : null;
      if (!list || list.length === 0) {
        return {
          ok: false,
          count: 0,
          error: 'No valid resume drafts found in backup file.',
        };
      }
      setDrafts(list);
      setActiveDraftId(list[0].id);
      if (parsed?.preferences) {
        setPreferences((prev) => ({ ...prev, ...parsed.preferences }));
      }
      if (auth.currentUser) {
        void handleSaveAllDraftsToCloud(list);
      }
      return { ok: true, count: list.length };
    } catch {
      return {
        ok: false,
        count: 0,
        error: 'Invalid JSON format. Please upload a valid VitaeFlow backup file.',
      };
    }
  };

  const handleResetToSampleResumes = () => {
    setDrafts(SAMPLE_RESUMES);
    setActiveDraftId(SAMPLE_RESUMES[0].id);
    if (auth.currentUser) {
      try {
        window.localStorage.setItem(
          getUserStorageKey(auth.currentUser.uid),
          JSON.stringify(SAMPLE_RESUMES)
        );
      } catch {
        // Ignore
      }
    }
  };

  const handleClearLocalStorage = () => {
    try {
      if (auth.currentUser) {
        window.localStorage.removeItem(getUserStorageKey(auth.currentUser.uid));
        window.localStorage.removeItem(getUserPrefsKey(auth.currentUser.uid));
      }
    } catch {
      // Ignore
    }
    const blank = createBlankResume('My Primary Resume');
    setDrafts([blank]);
    setActiveDraftId(blank.id);
    setPreferences(DEFAULT_PREFS);
  };

  const openDefaultAiEnhancer = () => {
    setAiModalConfig({
      isOpen: true,
      initialText:
        activeResume.experience[0]?.bullets[0] ||
        activeResume.personalInfo.summary,
      roleTitle: activeResume.personalInfo.jobTitle,
      companyName: activeResume.experience[0]?.company,
      mode: 'rewrite_bullet',
      onApply: (rewritten) => {
        if (activeResume.experience.length > 0) {
          const nextExp = [...activeResume.experience];
          const nextBullets = [...nextExp[0].bullets];
          nextBullets[0] = rewritten;
          nextExp[0] = { ...nextExp[0], bullets: nextBullets };
          handleUpdateActiveResume({
            ...activeResume,
            updatedAt: new Date().toISOString(),
            experience: nextExp,
          });
        }
      },
    });
  };

  const openAiEnhancer = (cfg: AiModalOpenConfig) => {
    setAiModalConfig({
      isOpen: true,
      mode: cfg.mode || 'rewrite_bullet',
      ...cfg,
    });
  };

  return (
    <ResumeContext.Provider
      value={{
        drafts,
        activeDraftId,
        activeResume,
        hasLoadedStorage,
        preferences,
        targetEditorSection,
        setTargetEditorSection,
        setActiveDraftId,
        handleUpdateActiveResume,
        handleUpdateTemplate,
        handleUpdateAccent,
        handleUpdateCustomColors,
        handleUpdateFontFamily,
        handleUpdateDecorativeHeading,
        handleCreateBlankDraft,
        handleImportResumeSuccess,
        handleDuplicateDraft,
        handleRenameDraft,
        handleDeleteDraft,
        handleSelectExampleResume,
        handleExportPdf,
        handleUpdatePreferences,
        handleExportAllJsonBackup,
        handleRestoreJsonBackup,
        handleResetToSampleResumes,
        handleClearLocalStorage,
        aiUsage,
        customAiLimit,
        setAiUsage,
        handleChangeCustomAiLimit,
        handleResetAiQuota,
        openDefaultAiEnhancer,
        openAiEnhancer,
        openFullResumePolishModal: () => setIsFullPolishModalOpen(true),
        openImportModal: () => setIsImportModalOpen(true),
        openDraftsModal: () => setIsDraftsModalOpen(true),
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        user,
        isAuthReady,
        isCloudSyncing,
        lastCloudSyncedAt,
        cloudQuotaExceeded,
        dismissQuotaBanner: () => setCloudQuotaExceeded(false),
        isProtectedRouteEnforced,
        setIsProtectedRouteEnforced,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        handleRefreshAuthUser,
        handleSaveAllDraftsToCloud,
        handleReloadResumesFromCloud,
        handleSignOut,
        handleDeleteAccountAndData,
      }}
    >
      {children}

      {/* Global Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global AI Bullet Point Enhancer & Wording Improver Modal */}
      <AiBulletModal
        isOpen={aiModalConfig.isOpen}
        initialText={aiModalConfig.initialText}
        roleTitle={aiModalConfig.roleTitle}
        companyName={aiModalConfig.companyName}
        mode={aiModalConfig.mode}
        missingAtsKeywords={activeResume.atsAnalysis?.missingKeywords}
        resumeContext={createResumeContextSnapshot(activeResume)}
        customLimit={customAiLimit}
        onUsageUpdate={setAiUsage}
        onClose={() => setAiModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onApply={aiModalConfig.onApply}
      />

      {/* Global Whole-Resume AI Polish & Alignment Modal */}
      <AiFullResumePolishModal
        isOpen={isFullPolishModalOpen}
        resume={activeResume}
        customLimit={customAiLimit}
        onUsageUpdate={setAiUsage}
        onApplyPolishedResume={handleUpdateActiveResume}
        onClose={() => setIsFullPolishModalOpen(false)}
      />

      {/* Global Import Resume Modal */}
      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportResumeSuccess}
      />

      {/* Global Saved Drafts Manager Modal */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        drafts={drafts}
        activeDraftId={activeResume.id}
        onSelectDraft={(id) => setActiveDraftId(id)}
        onCreateBlankDraft={(title) => handleCreateBlankDraft(title)}
        onDuplicateDraft={handleDuplicateDraft}
        onRenameDraft={handleRenameDraft}
        onDeleteDraft={handleDeleteDraft}
        onClose={() => setIsDraftsModalOpen(false)}
      />
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return ctx;
}
