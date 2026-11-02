'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
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
import ImportResumeModal from '@/components/ImportResumeModal';
import DraftsModal from '@/components/DraftsModal';

const STORAGE_KEY = 'vitaeflow_resumes_v2';
const PREFS_KEY = 'vitaeflow_prefs_v1';

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
  openImportModal: () => void;
  openDraftsModal: () => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  // Navigation Sidebar & Mobile Drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Configurable AI Usage Quota State (with Automatic Multi-Model Failover)
  const [customAiLimit, setCustomAiLimit] = useState<number>(50);
  const [aiUsage, setAiUsage] = useState<AiUsageMetadata>({
    used: 0,
    limit: 50,
    remaining: 50,
    resetAt: new Date(Date.now() + 3600000).toISOString(),
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

  // Load saved drafts & preferences from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDrafts(parsed);
          setActiveDraftId(parsed[0].id);
        }
      }
      const rawPrefs = window.localStorage.getItem(PREFS_KEY);
      if (rawPrefs) {
        const parsedPrefs = JSON.parse(rawPrefs);
        if (parsedPrefs && typeof parsedPrefs === 'object') {
          setPreferences((prev) => ({ ...prev, ...parsedPrefs }));
        }
      }
    } catch {
      // Fallback to SAMPLE_RESUMES
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  // Save drafts to localStorage on change
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Ignore storage quota errors
    }
  }, [drafts, hasLoadedStorage]);

  // Save preferences on change
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage quota errors
    }
  }, [preferences, hasLoadedStorage]);

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
  };

  const handleRenameDraft = (id: string, newTitle: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, title: newTitle, updatedAt: new Date().toISOString() }
          : d
      )
    );
  };

  const handleDeleteDraft = (id: string) => {
    if (drafts.length <= 1) return;
    const remaining = drafts.filter((d) => d.id !== id);
    setDrafts(remaining);
    if (activeDraftId === id) {
      setActiveDraftId(remaining[0].id);
    }
  };

  const handleSelectExampleResume = (exampleDraft: ResumeDraft) => {
    const exists = drafts.some((d) => d.id === exampleDraft.id);
    if (!exists) {
      setDrafts((prev) => [exampleDraft, ...prev]);
    }
    setActiveDraftId(exampleDraft.id);
  };

  const handleExportPdf = (draftOverride?: ResumeDraft) => {
    downloadResumePdf(draftOverride || activeResume);
  };

  const handleUpdatePreferences = (next: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...next }));
  };

  const handleExportAllJsonBackup = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_RESUMES));
    } catch {
      // Ignore
    }
  };

  const handleClearLocalStorage = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(PREFS_KEY);
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
        openImportModal: () => setIsImportModalOpen(true),
        openDraftsModal: () => setIsDraftsModalOpen(true),
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
      }}
    >
      {children}

      {/* Global AI Bullet Point Enhancer & Wording Improver Modal */}
      <AiBulletModal
        isOpen={aiModalConfig.isOpen}
        initialText={aiModalConfig.initialText}
        roleTitle={aiModalConfig.roleTitle}
        companyName={aiModalConfig.companyName}
        mode={aiModalConfig.mode}
        missingAtsKeywords={activeResume.atsAnalysis?.missingKeywords}
        customLimit={customAiLimit}
        onUsageUpdate={setAiUsage}
        onClose={() => setAiModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onApply={aiModalConfig.onApply}
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
