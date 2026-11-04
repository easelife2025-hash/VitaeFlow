'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Languages,
  Plus,
  Trash2,
  Wand2,
  Sparkles,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Check,
  SlidersHorizontal,
  Camera,
  EyeOff,
} from 'lucide-react';
import {
  ResumeDraft,
  PersonalInfo,
  PhotoShape,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  LanguageProficiency,
  AiEnhancerMode,
  SummaryVariation,
  SuggestedSkillItem,
  AiUsageMetadata,
  EditorSectionId,
} from '@/lib/types';
import {
  buildFactSafeSummaryVariations,
  buildFactSafeSkillSuggestions,
} from '@/lib/ai-fallback';
import { authenticatedFetch } from '@/lib/firebase';

interface ResumeEditorProps {
  resume: ResumeDraft;
  onChange: (updated: ResumeDraft) => void;
  externalSection?: EditorSectionId;
  aiUsage: AiUsageMetadata;
  customAiLimit: number;
  onChangeCustomAiLimit: (newLimit: number) => void;
  onUpdateAiUsage: (usage: AiUsageMetadata) => void;
  onResetAiQuota: () => void;
  onOpenAiEnhancer: (config: {
    initialText: string;
    roleTitle: string;
    companyName?: string;
    mode?: AiEnhancerMode;
    onApply: (newText: string) => void;
  }) => void;
  onOpenFullResumePolish?: () => void;
  onGenerateResume?: () => void;
}

export type EditorSection = EditorSectionId;

const LANGUAGE_PROFICIENCIES: LanguageProficiency[] = [
  'Native / Bilingual',
  'Full Professional',
  'Professional Working',
  'Conversational',
  'Elementary',
];

const SUGGESTED_SKILLS = [
  'TypeScript',
  'React',
  'Next.js',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'PostgreSQL',
  'GraphQL',
  'AWS',
  'Docker',
  'Playwright',
  'System Design',
];

export default function ResumeEditor({
  resume,
  onChange,
  externalSection,
  aiUsage,
  customAiLimit,
  onChangeCustomAiLimit,
  onUpdateAiUsage,
  onResetAiQuota,
  onOpenAiEnhancer,
  onOpenFullResumePolish,
  onGenerateResume,
}: ResumeEditorProps) {
  const [openSection, setOpenSection] = useState<EditorSection>(
    externalSection || 'personal'
  );
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (externalSection) {
      setOpenSection(externalSection);
    }
  }, [externalSection]);

  // AI Summary Generation Review State
  const [summaryVariations, setSummaryVariations] = useState<SummaryVariation[]>(
    []
  );
  const [editableSummaries, setEditableSummaries] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // AI Skill Suggestions Review State
  const [aiSkillSuggestions, setAiSkillSuggestions] = useState<
    SuggestedSkillItem[]
  >([]);
  const [selectedAiSkills, setSelectedAiSkills] = useState<string[]>([]);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const certifications = resume.certifications || [];
  const languages = resume.languages || [];

  // Clear review panels when switching active resume draft
  useEffect(() => {
    setSummaryVariations([]);
    setEditableSummaries([]);
    setSummaryError(null);
    setAiSkillSuggestions([]);
    setSelectedAiSkills([]);
    setSkillsError(null);
  }, [resume.id]);

  // Personal Info Updater
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      personalInfo: {
        ...resume.personalInfo,
        [field]: value,
      },
    });
  };

  const updatePersonalInfoPatch = (patch: Partial<PersonalInfo>) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      personalInfo: {
        ...resume.personalInfo,
        ...patch,
      },
    });
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 420;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          updatePersonalInfoPatch({
            photoUrl: compressedDataUrl,
            photoShape:
              resume.personalInfo.photoShape &&
              resume.personalInfo.photoShape !== 'hidden'
                ? resume.personalInfo.photoShape
                : 'circle',
            photoZoom: resume.personalInfo.photoZoom ?? 100,
            photoOffsetX: resume.personalInfo.photoOffsetX ?? 0,
            photoOffsetY: resume.personalInfo.photoOffsetY ?? 0,
          });
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Generate Professional Summary Handler
  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    setSummaryError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await authenticatedFetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-custom-limit': String(customAiLimit),
        },
        body: JSON.stringify({
          jobTitle: resume.personalInfo.jobTitle,
          currentSummary: resume.personalInfo.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
          certifications: resume.certifications,
          jobDescriptionDraft: resume.jobDescriptionDraft,
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (data.usage) {
        onUpdateAiUsage(data.usage);
      }

      if (!res.ok) {
        if (res.status === 400 && data.error) {
          setSummaryError(data.error);
          return;
        }
        throw new Error(
          data.error || 'Failed to generate professional summary.'
        );
      }

      const list: SummaryVariation[] =
        Array.isArray(data.variations) && data.variations.length > 0
          ? data.variations
          : buildFactSafeSummaryVariations({
              jobTitle: resume.personalInfo.jobTitle,
              currentSummary: resume.personalInfo.summary,
              experience: resume.experience,
              education: resume.education,
              skills: resume.skills,
              projects: resume.projects,
            });
      setSummaryVariations(list);
      setEditableSummaries(list.map((v) => v.summaryText));
    } catch {
      const fallbackList = buildFactSafeSummaryVariations({
        jobTitle: resume.personalInfo.jobTitle,
        currentSummary: resume.personalInfo.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
      });
      setSummaryVariations(fallbackList);
      setEditableSummaries(fallbackList.map((v) => v.summaryText));
      setSummaryError(null);
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingSummary(false);
    }
  }, [resume, customAiLimit, onUpdateAiUsage]);

  // AI Suggest Relevant Skills Handler
  const handleSuggestSkillsWithAi = useCallback(async () => {
    setIsSuggestingSkills(true);
    setSkillsError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await authenticatedFetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-custom-limit': String(customAiLimit),
        },
        body: JSON.stringify({
          jobTitle: resume.personalInfo.jobTitle,
          summary: resume.personalInfo.summary,
          experience: resume.experience,
          projects: resume.projects,
          education: resume.education,
          certifications: resume.certifications,
          jobDescriptionDraft: resume.jobDescriptionDraft,
          existingSkills: resume.skills,
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (data.usage) {
        onUpdateAiUsage(data.usage);
      }

      if (!res.ok) {
        if (res.status === 400 && data.error) {
          setSkillsError(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to suggest relevant skills.');
      }

      const list: SuggestedSkillItem[] =
        Array.isArray(data.suggestions) && data.suggestions.length > 0
          ? data.suggestions
          : buildFactSafeSkillSuggestions({
              jobTitle: resume.personalInfo.jobTitle,
              summary: resume.personalInfo.summary,
              experience: resume.experience,
              projects: resume.projects,
              education: resume.education,
              existingSkills: resume.skills,
            });
      setAiSkillSuggestions(list);
      setSelectedAiSkills(list.map((item) => item.skill));
    } catch {
      const fallbackList = buildFactSafeSkillSuggestions({
        jobTitle: resume.personalInfo.jobTitle,
        summary: resume.personalInfo.summary,
        experience: resume.experience,
        projects: resume.projects,
        education: resume.education,
        existingSkills: resume.skills,
      });
      setAiSkillSuggestions(fallbackList);
      setSelectedAiSkills(fallbackList.map((item) => item.skill));
      setSkillsError(null);
    } finally {
      clearTimeout(timeoutId);
      setIsSuggestingSkills(false);
    }
  }, [resume, customAiLimit, onUpdateAiUsage]);

  const toggleSelectAiSkill = (skillName: string) => {
    setSelectedAiSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleApplySelectedAiSkills = () => {
    if (selectedAiSkills.length === 0) return;
    const merged = Array.from(new Set([...resume.skills, ...selectedAiSkills]));
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      skills: merged,
    });
    setAiSkillSuggestions((prev) =>
      prev.filter((item) => !selectedAiSkills.includes(item.skill))
    );
    setSelectedAiSkills([]);
  };

  const handleAddSingleAiSkill = (skillName: string) => {
    if (!resume.skills.includes(skillName)) {
      onChange({
        ...resume,
        updatedAt: new Date().toISOString(),
        skills: [...resume.skills, skillName],
      });
    }
    setAiSkillSuggestions((prev) =>
      prev.filter((item) => item.skill !== skillName)
    );
    setSelectedAiSkills((prev) => prev.filter((s) => s !== skillName));
  };

  // Experience Updaters
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Role Title',
      location: 'City, State',
      startDate: 'Jan 2024',
      endDate: 'Present',
      current: true,
      bullets: [
        'Delivered key product initiatives that improved team velocity and customer adoption.',
      ],
    };
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      experience: [newExp, ...resume.experience],
    });
  };

  const updateExperience = (
    expId: string,
    patch: Partial<ExperienceItem>
  ) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      experience: resume.experience.map((e) =>
        e.id === expId ? { ...e, ...patch } : e
      ),
    });
  };

  const removeExperience = (expId: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      experience: resume.experience.filter((e) => e.id !== expId),
    });
  };

  // Education Updaters
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'B.S.',
      field: 'Computer Science',
      location: 'City, State',
      startDate: 'Aug 2019',
      endDate: 'May 2023',
      gpa: '',
    };
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      education: [...resume.education, newEdu],
    });
  };

  const updateEducation = (eduId: string, patch: Partial<EducationItem>) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      education: resume.education.map((edu) =>
        edu.id === eduId ? { ...edu, ...patch } : edu
      ),
    });
  };

  const removeEducation = (eduId: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      education: resume.education.filter((edu) => edu.id !== eduId),
    });
  };

  // Skills Updaters
  const addSkillString = (skillText: string) => {
    const cleaned = skillText.trim();
    if (!cleaned) return;
    if (!resume.skills.includes(cleaned)) {
      onChange({
        ...resume,
        updatedAt: new Date().toISOString(),
        skills: [...resume.skills, cleaned],
      });
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    addSkillString(newSkill);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      skills: resume.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Projects Updaters
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: 'Project Title',
      subtitle: 'Tech Stack or Brief Role',
      link: 'github.com/username/project',
      bullets: [
        'Built and deployed a full-stack application serving real-time analytics.',
      ],
    };
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      projects: [...resume.projects, newProj],
    });
  };

  const updateProject = (projId: string, patch: Partial<ProjectItem>) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      projects: resume.projects.map((p) =>
        p.id === projId ? { ...p, ...patch } : p
      ),
    });
  };

  const removeProject = (projId: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      projects: resume.projects.filter((p) => p.id !== projId),
    });
  };

  // Certifications Updaters
  const addCertification = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024',
      credentialId: 'AWS-CSA-1029',
    };
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      certifications: [...certifications, newCert],
    });
  };

  const updateCertification = (
    certId: string,
    patch: Partial<CertificationItem>
  ) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      certifications: certifications.map((c) =>
        c.id === certId ? { ...c, ...patch } : c
      ),
    });
  };

  const removeCertification = (certId: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      certifications: certifications.filter((c) => c.id !== certId),
    });
  };

  // Languages Updaters
  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: 'Spanish',
      proficiency: 'Professional Working',
    };
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      languages: [...languages, newLang],
    });
  };

  const updateLanguage = (langId: string, patch: Partial<LanguageItem>) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      languages: languages.map((l) =>
        l.id === langId ? { ...l, ...patch } : l
      ),
    });
  };

  const removeLanguage = (langId: string) => {
    onChange({
      ...resume,
      updatedAt: new Date().toISOString(),
      languages: languages.filter((l) => l.id !== langId),
    });
  };

  const sectionTabs: {
    id: EditorSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: AlignLeft },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase,
      count: resume.experience.length,
    },
    {
      id: 'education',
      label: 'Education',
      icon: GraduationCap,
      count: resume.education.length,
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: Wrench,
      count: resume.skills.length,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
      count: resume.projects.length,
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: Award,
      count: certifications.length,
    },
    {
      id: 'languages',
      label: 'Languages',
      icon: Languages,
      count: languages.length,
    },
  ];

  const currentIdx = sectionTabs.findIndex((s) => s.id === openSection);
  const prevSection = currentIdx > 0 ? sectionTabs[currentIdx - 1] : null;
  const nextSection =
    currentIdx < sectionTabs.length - 1 ? sectionTabs[currentIdx + 1] : null;

  return (
    <div className="space-y-4">
      {/* Server-Side Gemini Fact-Preservation & Auto-Switch Model Quota Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0" />
          <span>
            <strong className="text-[#18181B]">Fact-Safe Gemini AI:</strong>{' '}
            Preserves your real history & never invents metrics.
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#6D5CE8]/10 text-[#6D5CE8] px-2 py-0.5 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18B89A]" />
            <span>
              {aiUsage.activeModelLabel || 'Gemini 3.8 Flash'} · Auto-Switch Active
            </span>
          </span>
          {aiUsage.switchedFromModel && (
            <span className="inline-flex items-center rounded-lg bg-[#18B89A]/15 text-[#0F766E] px-2 py-0.5 font-medium text-[11px]">
              Auto-switched from {aiUsage.switchedFromModel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div
            className="flex items-center gap-1.5 text-slate-600"
            title="Tracks requests on the current model. When this limit is reached, VitaeFlow automatically switches to the next Gemini model so you are never blocked."
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6D5CE8]" />
            <span>Model Usage:</span>
            <span className="font-mono tabular-nums font-semibold text-[#18181B]">
              {aiUsage.used}/{aiUsage.limit}
            </span>
          </div>

          <label className="inline-flex items-center gap-1 text-slate-500">
            <span>Switch at:</span>
            <select
              aria-label="Configure per-model request threshold before auto-switching"
              value={customAiLimit}
              onChange={(e) => onChangeCustomAiLimit(Number(e.target.value))}
              className="h-7 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
            >
              <option value={15}>15 / model</option>
              <option value={30}>30 / model</option>
              <option value={50}>50 / model</option>
              <option value={100}>100 / model</option>
              <option value={250}>250 / model</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onResetAiQuota}
            className="text-xs font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
          >
            Reset
          </button>

          {onOpenFullResumePolish && (
            <button
              type="button"
              onClick={onOpenFullResumePolish}
              className="min-h-[32px] px-3 py-1 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Polish Whole Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* 8-Section Navigation Bar */}
      <div
        role="tablist"
        aria-label="Resume sections"
        className="flex items-center gap-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs"
      >
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = openSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setOpenSection(tab.id)}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#6D5CE8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#18181B] hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    isActive ? 'text-white/85' : 'text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: PERSONAL DETAILS */}
      {openSection === 'personal' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3.5">
            <h2 className="font-display text-base font-bold text-[#18181B]">
              Personal Details & Profile Photo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact details, optional profile portrait, and target role headline displayed at the top of your A4 resume.
            </p>
          </div>

          {/* Optional Profile Photo Studio */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Framed Avatar Preview */}
                <div
                  className={`w-16 h-16 shrink-0 border-2 border-[#6D5CE8]/30 bg-white overflow-hidden flex items-center justify-center relative ${
                    (resume.personalInfo.photoShape || 'circle') === 'circle'
                      ? 'rounded-full'
                      : 'rounded-2xl'
                  }`}
                >
                  {resume.personalInfo.photoUrl &&
                  resume.personalInfo.photoShape !== 'hidden' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resume.personalInfo.photoUrl}
                      alt={resume.personalInfo.fullName || 'Profile'}
                      className="w-full h-full object-cover transition-transform duration-75"
                      style={{
                        transform: `scale(${
                          (resume.personalInfo.photoZoom ?? 100) / 100
                        }) translate(${
                          resume.personalInfo.photoOffsetX ?? 0
                        }%, ${resume.personalInfo.photoOffsetY ?? 0}%)`,
                      }}
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-[#18181B] block">
                    Optional Profile Photo
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Upload a headshot and choose Circular, Rounded-Square, or Hidden layout.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {resume.personalInfo.photoUrl
                      ? 'Change Photo'
                      : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>

                {resume.personalInfo.photoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      updatePersonalInfoPatch({
                        photoUrl: undefined,
                        photoZoom: 100,
                        photoOffsetX: 0,
                        photoOffsetY: 0,
                      })
                    }
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {resume.personalInfo.photoUrl && (
              <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Frame Shape Toggle */}
                <div className="sm:col-span-5 space-y-1.5">
                  <span className="block text-[11px] font-semibold text-slate-600">
                    Photo Frame Style
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'circle', label: 'Circular' },
                        { id: 'square', label: 'Square' },
                        { id: 'hidden', label: 'Hidden' },
                      ] as { id: PhotoShape; label: string }[]
                    ).map((shapeOpt) => {
                      const activeShape =
                        resume.personalInfo.photoShape || 'circle';
                      const isSel = activeShape === shapeOpt.id;
                      return (
                        <button
                          key={shapeOpt.id}
                          type="button"
                          onClick={() =>
                            updatePersonalInfoPatch({ photoShape: shapeOpt.id })
                          }
                          className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSel
                              ? 'border-[#6D5CE8] bg-[#6D5CE8] text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:text-[#18181B]'
                          }`}
                        >
                          {shapeOpt.id === 'hidden' && (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span>{shapeOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom & Position Sliders */}
                <div className="sm:col-span-7 grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Zoom</span>
                      <span className="font-mono tabular-nums text-[10px]">
                        {resume.personalInfo.photoZoom ?? 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={220}
                      step={5}
                      value={resume.personalInfo.photoZoom ?? 100}
                      onChange={(e) =>
                        updatePersonalInfoPatch({
                          photoZoom: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#6D5CE8] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Pan X</span>
                      <span className="font-mono tabular-nums text-[10px]">
                        {resume.personalInfo.photoOffsetX ?? 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={2}
                      value={resume.personalInfo.photoOffsetX ?? 0}
                      onChange={(e) =>
                        updatePersonalInfoPatch({
                          photoOffsetX: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#6D5CE8] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Pan Y</span>
                      <span className="font-mono tabular-nums text-[10px]">
                        {resume.personalInfo.photoOffsetY ?? 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={2}
                      value={resume.personalInfo.photoOffsetY ?? 0}
                      onChange={(e) =>
                        updatePersonalInfoPatch({
                          photoOffsetY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#6D5CE8] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resume Document Title (Dashboard Label)
              </label>
              <input
                type="text"
                value={resume.title}
                onChange={(e) =>
                  onChange({
                    ...resume,
                    updatedAt: new Date().toISOString(),
                    title: e.target.value,
                  })
                }
                placeholder="e.g., Senior Frontend Engineer — Q4 Applications"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={resume.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                placeholder="e.g., Elena Rostova"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Role / Headline
              </label>
              <input
                type="text"
                value={resume.personalInfo.jobTitle}
                onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={resume.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="name@domain.com"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={resume.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={resume.personalInfo.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Portfolio / Website
              </label>
              <input
                type="text"
                value={resume.personalInfo.website}
                onChange={(e) => updatePersonalInfo('website', e.target.value)}
                placeholder="yourportfolio.dev"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={resume.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PROFESSIONAL SUMMARY */}
      {openSection === 'summary' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Professional Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a tailored summary from your existing resume sections or improve your draft wording.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isGeneratingSummary ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {isGeneratingSummary
                    ? 'Generating Summary...'
                    : 'Generate Summary with AI'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenAiEnhancer({
                    initialText: resume.personalInfo.summary,
                    roleTitle: resume.personalInfo.jobTitle,
                    mode: 'improve_wording',
                    onApply: (newText) =>
                      updatePersonalInfo('summary', newText),
                  })
                }
                className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-[#6D5CE8] bg-[#6D5CE8]/10 hover:bg-[#6D5CE8]/15 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Improve Wording</span>
              </button>
            </div>
          </div>

          <div>
            <textarea
              rows={5}
              value={resume.personalInfo.summary}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder="Summarize your years of experience, core domain strengths, and measurable career highlights..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>Recommended length: 250–450 characters</span>
              <span className="font-mono tabular-nums">
                {resume.personalInfo.summary.length} chars
              </span>
            </div>
          </div>

          {/* Summary AI Error Banner */}
          {summaryError && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{summaryError}</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Summary AI Loading Skeleton */}
          {isGeneratingSummary && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600">
                Synthesizing facts from your experience, skills, and education...
              </p>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-2.5"
                >
                  <div className="h-3.5 w-40 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-5/6 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Summary AI Review-Before-Apply Panel */}
          {!isGeneratingSummary && summaryVariations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#18181B]">
                    Review AI Summary Suggestions (Grounded in Your Resume Facts)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review or edit any option below before clicking Apply Summary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSummaryVariations([]);
                    setEditableSummaries([]);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-[#18181B] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              {summaryVariations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-slate-50/40 space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#6D5CE8]">
                      {item.styleLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updatePersonalInfo(
                          'summary',
                          editableSummaries[idx] || item.summaryText
                        );
                        setSummaryVariations([]);
                        setEditableSummaries([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#18B89A] hover:bg-[#149E83] text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Summary</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={editableSummaries[idx] ?? item.summaryText}
                    onChange={(e) => {
                      const next = [...editableSummaries];
                      next[idx] = e.target.value;
                      setEditableSummaries(next);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none"
                  />

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A] shrink-0" />
                    <span>Facts used: {item.groundedFactsUsed}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: WORK EXPERIENCE */}
      {openSection === 'experience' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Work Experience
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rewrite bullet points or improve wording while preserving your exact factual history.
              </p>
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>

          {resume.experience.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-3">
                No work experience entries added yet.
              </p>
              <button
                type="button"
                onClick={addExperience}
                className="px-4 py-2 text-xs font-semibold text-[#6D5CE8] bg-[#6D5CE8]/10 rounded-xl hover:bg-[#6D5CE8]/15 transition-colors cursor-pointer"
              >
                Add First Experience Entry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 space-y-6">
              {resume.experience.map((exp, expIdx) => (
                <div key={exp.id} className={expIdx > 0 ? 'pt-6' : ''}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-display text-sm font-bold text-[#18181B]">
                      {exp.role || 'Untitled Role'} · {exp.company || 'Company'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      aria-label="Remove role"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(exp.id, { role: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, { company: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(exp.id, { location: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              startDate: e.target.value,
                            })
                          }
                          placeholder="Jan 2022"
                          className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          End Date
                        </label>
                        <input
                          type="text"
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) =>
                            updateExperience(exp.id, { endDate: e.target.value })
                          }
                          placeholder="Present"
                          className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] disabled:bg-slate-50 disabled:text-slate-400 focus:border-[#6D5CE8] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperience(exp.id, {
                          current: e.target.checked,
                          endDate: e.target.checked ? 'Present' : exp.endDate,
                        })
                      }
                      className="rounded border-slate-300 text-[#6D5CE8] focus:ring-[#6D5CE8]"
                    />
                    <span>I currently work here</span>
                  </label>

                  {/* Bullet Points with Rewrite Bullet & Improve Wording AI Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Impact & Achievement Bullets
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateExperience(exp.id, {
                            bullets: [...exp.bullets, ''],
                          })
                        }
                        className="text-xs font-semibold text-[#6D5CE8] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const nextBullets = [...exp.bullets];
                              nextBullets[bIdx] = e.target.value;
                              updateExperience(exp.id, { bullets: nextBullets });
                            }}
                            placeholder="Describe what you built, led, or optimized..."
                            className="flex-1 rounded-xl border border-slate-200 p-3 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
                          />
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              title="Rewrite bullet point with AI"
                              onClick={() =>
                                onOpenAiEnhancer({
                                  initialText: bullet,
                                  roleTitle:
                                    exp.role || resume.personalInfo.jobTitle,
                                  companyName: exp.company,
                                  mode: 'rewrite_bullet',
                                  onApply: (rewritten) => {
                                    const nextBullets = [...exp.bullets];
                                    nextBullets[bIdx] = rewritten;
                                    updateExperience(exp.id, {
                                      bullets: nextBullets,
                                    });
                                  },
                                })
                              }
                              className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] hover:bg-[#6D5CE8] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Rewrite</span>
                            </button>

                            <button
                              type="button"
                              title="Improve wording and polish phrasing"
                              onClick={() =>
                                onOpenAiEnhancer({
                                  initialText: bullet,
                                  roleTitle:
                                    exp.role || resume.personalInfo.jobTitle,
                                  companyName: exp.company,
                                  mode: 'improve_wording',
                                  onApply: (polished) => {
                                    const nextBullets = [...exp.bullets];
                                    nextBullets[bIdx] = polished;
                                    updateExperience(exp.id, {
                                      bullets: nextBullets,
                                    });
                                  },
                                })
                              }
                              className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#18B89A]/10 text-[#18181B] hover:bg-[#18B89A] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#18B89A] group-hover:text-white" />
                              <span className="hidden sm:inline">Polish</span>
                            </button>

                            {exp.bullets.length > 1 && (
                              <button
                                type="button"
                                title="Delete bullet"
                                onClick={() => {
                                  const nextBullets = exp.bullets.filter(
                                    (_, i) => i !== bIdx
                                  );
                                  updateExperience(exp.id, {
                                    bullets: nextBullets,
                                  });
                                }}
                                className="min-h-[30px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: EDUCATION */}
      {openSection === 'education' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Education
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Academic degrees, universities, coursework, and honors.
              </p>
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 space-y-5">
            {resume.education.map((edu, idx) => (
              <div key={edu.id} className={idx > 0 ? 'pt-5' : ''}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-sm font-bold text-[#18181B]">
                    {edu.institution || 'Institution'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, { institution: e.target.value })
                      }
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, { degree: e.target.value })
                      }
                      placeholder="B.S. / M.S. / B.A."
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(edu.id, { field: e.target.value })
                      }
                      placeholder="Computer Science"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Start Year
                      </label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(edu.id, { startDate: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Graduation
                      </label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(edu.id, { endDate: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      GPA / Honors (Optional)
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) =>
                        updateEducation(edu.id, { gpa: e.target.value })
                      }
                      placeholder="3.9 / 4.0 · Magna Cum Laude"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: SKILLS (WITH AI SKILL SUGGESTIONS & REVIEW PANEL) */}
      {openSection === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Core Skills & ATS Keywords
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add skills manually or let AI suggest relevant skills based on your stated experience and projects.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSuggestSkillsWithAi}
              disabled={isSuggestingSkills}
              className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isSuggestingSkills ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isSuggestingSkills
                  ? 'Analyzing Experience...'
                  : 'Suggest Relevant Skills with AI'}
              </span>
            </button>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., TypeScript, Next.js, Product Strategy)..."
              className="flex-1 h-11 rounded-xl border border-slate-200 px-3.5 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </form>

          {/* AI Skill Suggestions Error Notice */}
          {skillsError && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{skillsError}</span>
              </div>
              <button
                type="button"
                onClick={handleSuggestSkillsWithAi}
                className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* AI Skill Suggestions Loading Skeleton */}
          {isSuggestingSkills && (
            <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse">
              <div className="h-4 w-56 bg-slate-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-16 rounded-xl bg-slate-200/80 border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Skill Suggestions Review-Before-Apply Panel */}
          {!isSuggestingSkills && aiSkillSuggestions.length > 0 && (
            <div className="p-4 rounded-2xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8]" />
                    <span>
                      Review AI-Suggested Skills ({aiSkillSuggestions.length})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Each suggestion is grounded in your stated experience and projects. Select the ones you want to add:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplySelectedAiSkills}
                    disabled={selectedAiSkills.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-[#18B89A] hover:bg-[#149E83] disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Add Selected ({selectedAiSkills.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiSkillSuggestions([]);
                      setSelectedAiSkills([]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-[#18181B] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {aiSkillSuggestions.map((item) => {
                  const isChecked = selectedAiSkills.includes(item.skill);
                  return (
                    <div
                      key={item.skill}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                        isChecked
                          ? 'border-[#6D5CE8] bg-white shadow-2xs'
                          : 'border-slate-200 bg-white/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectAiSkill(item.skill)}
                            className="rounded border-slate-300 text-[#6D5CE8] focus:ring-[#6D5CE8]"
                          />
                          <span className="text-xs font-bold text-[#18181B]">
                            {item.skill}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddSingleAiSkill(item.skill)}
                            className="px-2 py-0.5 rounded-md bg-[#18B89A]/15 text-[#18181B] hover:bg-[#18B89A] hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {item.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Current Skill Buttons */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-2">
              Active Resume Skills ({resume.skills.length}) — Tap to remove:
            </span>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  title={`Remove ${skill}`}
                  className="group min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-200 hover:bg-red-50/60 text-xs font-medium text-[#18181B] hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{skill}</span>
                  <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Add Suggested Skills */}
          <div className="pt-3 border-t border-slate-100">
            <span className="block text-xs font-medium text-slate-500 mb-2">
              Quick-add popular technical keywords:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.filter((s) => !resume.skills.includes(s)).map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSkillString(suggestion)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#18B89A] text-xs text-slate-600 hover:text-[#18B89A] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{suggestion}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PROJECTS */}
      {openSection === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Selected Projects & Open Source
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showcase portfolio builds, research, or technical case studies.
              </p>
            </div>
            <button
              type="button"
              onClick={addProject}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {resume.projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-3">
                No projects listed yet.
              </p>
              <button
                type="button"
                onClick={addProject}
                className="px-4 py-2 text-xs font-semibold text-[#6D5CE8] bg-[#6D5CE8]/10 rounded-xl hover:bg-[#6D5CE8]/15 transition-colors cursor-pointer"
              >
                Add First Project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 space-y-5">
              {resume.projects.map((proj, pIdx) => (
                <div key={proj.id} className={pIdx > 0 ? 'pt-5' : ''}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-sm font-bold text-[#18181B]">
                      {proj.name || 'Project'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) =>
                          updateProject(proj.id, { name: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Subtitle / Tech Stack
                      </label>
                      <input
                        type="text"
                        value={proj.subtitle}
                        onChange={(e) =>
                          updateProject(proj.id, { subtitle: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Link / Repository
                      </label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) =>
                          updateProject(proj.id, { link: e.target.value })
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {proj.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const nextBullets = [...proj.bullets];
                            nextBullets[bIdx] = e.target.value;
                            updateProject(proj.id, { bullets: nextBullets });
                          }}
                          className="flex-1 rounded-xl border border-slate-200 p-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                        />
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenAiEnhancer({
                                initialText: bullet,
                                roleTitle: proj.name,
                                mode: 'rewrite_bullet',
                                onApply: (rewritten) => {
                                  const nextBullets = [...proj.bullets];
                                  nextBullets[bIdx] = rewritten;
                                  updateProject(proj.id, {
                                    bullets: nextBullets,
                                  });
                                },
                              })
                            }
                            className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] hover:bg-[#6D5CE8] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Rewrite</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onOpenAiEnhancer({
                                initialText: bullet,
                                roleTitle: proj.name,
                                mode: 'improve_wording',
                                onApply: (polished) => {
                                  const nextBullets = [...proj.bullets];
                                  nextBullets[bIdx] = polished;
                                  updateProject(proj.id, {
                                    bullets: nextBullets,
                                  });
                                },
                              })
                            }
                            className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#18B89A]/10 text-[#18181B] hover:bg-[#18B89A] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#18B89A]" />
                            <span className="hidden sm:inline">Polish</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: CERTIFICATIONS */}
      {openSection === 'certifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Certifications & Licenses
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cloud credentials, professional licenses, and verified industry certificates.
              </p>
            </div>
            <button
              type="button"
              onClick={addCertification}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-3">
                No certifications added yet.
              </p>
              <button
                type="button"
                onClick={addCertification}
                className="px-4 py-2 text-xs font-semibold text-[#6D5CE8] bg-[#6D5CE8]/10 rounded-xl hover:bg-[#6D5CE8]/15 transition-colors cursor-pointer"
              >
                Add First Certification
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 space-y-5">
              {certifications.map((cert, idx) => (
                <div key={cert.id} className={idx > 0 ? 'pt-5' : ''}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-sm font-bold text-[#18181B]">
                      {cert.name || 'Certification'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Certificate / License Name
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(cert.id, { name: e.target.value })
                        }
                        placeholder="e.g., AWS Certified Solutions Architect — Professional"
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Issuing Organization
                      </label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(cert.id, {
                            issuer: e.target.value,
                          })
                        }
                        placeholder="e.g., Amazon Web Services"
                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Issue Year / Date
                        </label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) =>
                            updateCertification(cert.id, {
                              date: e.target.value,
                            })
                          }
                          placeholder="2024"
                          className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Credential ID
                        </label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) =>
                            updateCertification(cert.id, {
                              credentialId: e.target.value,
                            })
                          }
                          placeholder="Optional ID"
                          className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: LANGUAGES */}
      {openSection === 'languages' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#18181B]">
                Languages & Proficiency
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Spoken and written languages with standard proficiency levels.
              </p>
            </div>
            <button
              type="button"
              onClick={addLanguage}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Language</span>
            </button>
          </div>

          {languages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 mb-3">
                No languages added yet.
              </p>
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-2 text-xs font-semibold text-[#6D5CE8] bg-[#6D5CE8]/10 rounded-xl hover:bg-[#6D5CE8]/15 transition-colors cursor-pointer"
              >
                Add First Language
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/40"
                >
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) =>
                        updateLanguage(lang.id, { language: e.target.value })
                      }
                      placeholder="e.g., English, Spanish, Mandarin"
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Proficiency Level
                    </label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) =>
                        updateLanguage(lang.id, {
                          proficiency: e.target.value as LanguageProficiency,
                        })
                      }
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#18181B] focus:border-[#6D5CE8] focus:outline-none"
                    >
                      {LANGUAGE_PROFICIENCIES.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex justify-end sm:pt-5">
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      aria-label="Remove language"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Previous / Next Section Stepper Bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
        {prevSection ? (
          <button
            type="button"
            onClick={() => setOpenSection(prevSection.id)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-[#18181B] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: {prevSection.label}</span>
          </button>
        ) : (
          <div />
        )}

        <span className="font-mono tabular-nums text-xs text-slate-400">
          Section {currentIdx + 1} of {sectionTabs.length}
        </span>

        {nextSection ? (
          <button
            type="button"
            onClick={() => setOpenSection(nextSection.id)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next: {nextSection.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onChange({
                ...resume,
                updatedAt: new Date().toISOString(),
              });
              if (onGenerateResume) {
                onGenerateResume();
              }
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Resume</span>
          </button>
        )}
      </div>
    </div>
  );
}
