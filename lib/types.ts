export type TemplateId =
  | 'modern-violet'
  | 'executive-minimal'
  | 'teal-split'
  | 'creative-studio'
  | 'professional-ats'
  | 'elegant-editorial';

export type AccentColor = string;

export type ResumeFontFamily = 'inter' | 'lato' | 'roboto' | 'playfair';

export type PhotoShape = 'circle' | 'square' | 'hidden';

export interface CustomColors {
  primary: string;
  accent: string;
  heading: string;
  paletteId?: string;
}

export interface ColorPalettePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  heading: string;
}

export const COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'royal-violet',
    name: 'Royal Violet',
    primary: '#6D5CE8',
    accent: '#18B89A',
    heading: '#18181B',
  },
  {
    id: 'emerald-teal',
    name: 'Emerald Teal',
    primary: '#18B89A',
    accent: '#0F766E',
    heading: '#0F172A',
  },
  {
    id: 'executive-charcoal',
    name: 'Executive Charcoal',
    primary: '#18181B',
    accent: '#475569',
    heading: '#09090B',
  },
  {
    id: 'sapphire-navy',
    name: 'Sapphire Navy',
    primary: '#1D4ED8',
    accent: '#0284C7',
    heading: '#0F172A',
  },
  {
    id: 'burgundy-wine',
    name: 'Burgundy Editorial',
    primary: '#9F1239',
    accent: '#BE123C',
    heading: '#1C1917',
  },
  {
    id: 'forest-slate',
    name: 'Forest Slate',
    primary: '#15803D',
    accent: '#0D9488',
    heading: '#14532D',
  },
];

export const FONT_OPTIONS: {
  id: ResumeFontFamily;
  label: string;
  category: string;
  cssFamily: string;
  pdfFont: 'helvetica' | 'times';
}[] = [
  {
    id: 'inter',
    label: 'Inter',
    category: 'Clean Geometric Sans',
    cssFamily: 'var(--font-inter), sans-serif',
    pdfFont: 'helvetica',
  },
  {
    id: 'lato',
    label: 'Lato',
    category: 'Warm Humanist Sans',
    cssFamily: 'var(--font-lato), sans-serif',
    pdfFont: 'helvetica',
  },
  {
    id: 'roboto',
    label: 'Roboto',
    category: 'Crisp Corporate Neo-Grotesque',
    cssFamily: 'var(--font-roboto), sans-serif',
    pdfFont: 'helvetica',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    category: 'Editorial Serif Authority',
    cssFamily: 'var(--font-playfair), Georgia, serif',
    pdfFont: 'times',
  },
];

export const TEMPLATE_CATALOG: {
  id: TemplateId;
  shortLabel: string;
  name: string;
  subtitle: string;
  description: string;
  recommendedFor: string;
}[] = [
  {
    id: 'modern-violet',
    shortLabel: 'Modern',
    name: 'Modern Minimalist',
    subtitle: 'Clean Typography & Accent Bar',
    description:
      'Minimalist single-column hierarchy with a top color bar, vertical accent section markers, and a 3-column competency grid.',
    recommendedFor: 'Software Engineering, Product, Marketing & SaaS roles',
  },
  {
    id: 'executive-minimal',
    shortLabel: 'Executive',
    name: 'Executive Corporate',
    subtitle: 'Centered Authority & Double Rules',
    description:
      'Premium corporate layout with a centered header, strong double-rule borders, and classic executive typography.',
    recommendedFor: 'Directors, VP/C-Suite, Finance, Consulting & Operations',
  },
  {
    id: 'teal-split',
    shortLabel: 'Split Column',
    name: 'Split Column Sidebar',
    subtitle: 'Two-Column Asymmetric Layout',
    description:
      'Dedicated tinted sidebar for contact metadata, skills, education, and languages paired with a focused experience narrative column.',
    recommendedFor: 'Full-Stack Developers, Data Scientists & Product Managers',
  },
  {
    id: 'creative-studio',
    shortLabel: 'Creative',
    name: 'Creative Studio',
    subtitle: 'Bold Header Block & Visual Elements',
    description:
      'Expressive header banner with integrated photo showcase, timeline-accented experience blocks, and visual skill badges.',
    recommendedFor: 'UI/UX Designers, Creative Directors, Brand & Growth Leads',
  },
  {
    id: 'professional-ats',
    shortLabel: 'Professional',
    name: 'Professional Standard',
    subtitle: 'Traditional High-Density ATS Layout',
    description:
      'Time-tested institutional structure with crisp full-width solid section dividers, inline skill groupings, and right-aligned dates.',
    recommendedFor: 'Enterprise Engineering, Healthcare, Legal & Academia',
  },
  {
    id: 'elegant-editorial',
    shortLabel: 'Elegant',
    name: 'Elegant Editorial',
    subtitle: 'Sophisticated Dividers & Whitespace',
    description:
      'Refined editorial layout featuring ornamental diamond section dividers, graceful typographic rhythm, and balanced margins.',
    recommendedFor: 'Architecture, Communications, Strategy & Senior Leadership',
  },
];

export type EditorSectionId =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  photoUrl?: string;
  photoShape?: PhotoShape;
  photoZoom?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  link: string;
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export type LanguageProficiency =
  | 'Native / Bilingual'
  | 'Full Professional'
  | 'Professional Working'
  | 'Conversational'
  | 'Elementary';

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: LanguageProficiency;
}

export interface SectionCompletenessItem {
  sectionId: EditorSectionId;
  label: string;
  status: 'complete' | 'partial' | 'missing';
  earnedPoints: number;
  maxPoints: number;
  summary: string;
  recommendation?: string;
}

export interface FormattingWarningItem {
  id: string;
  severity: 'warning' | 'info';
  title: string;
  detail: string;
  targetSection: EditorSectionId;
}

export interface DeterministicAtsReport {
  estimatedQualityScore: number;
  completenessScore: number;
  formattingScore: number;
  keywordCoverageScore: number;
  sectionChecks: SectionCompletenessItem[];
  formattingWarnings: FormattingWarningItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
  totalBullets: number;
  quantifiedBullets: number;
  strongVerbBullets: number;
}

export interface AtsActionableSuggestion {
  title: string;
  advice: string;
  targetSection: EditorSectionId;
  priority: 'high' | 'medium';
}

export interface AtsBulletSuggestion {
  original: string;
  improved: string;
  reason: string;
  targetSection?: EditorSectionId;
}

export interface AtsAnalysisResult {
  jobTitle: string;
  score: number;
  roleAlignmentScore: number;
  impactMetricsScore: number;
  keywordCoverageScore: number;
  summaryFeedback: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  bulletSuggestions: AtsBulletSuggestion[];
  actionableSuggestions?: AtsActionableSuggestion[];
  analyzedAt: string;
}

export interface ResumeDraft {
  id: string;
  title: string;
  targetRole: string;
  updatedAt: string;
  templateId: TemplateId;
  accentColor: AccentColor;
  compactMode: boolean;
  fontFamily?: ResumeFontFamily;
  decorativeHeading?: boolean;
  customColors?: CustomColors;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  jobDescriptionDraft?: string;
  atsAnalysis?: AtsAnalysisResult;
}

export type WorkspaceTab = 'dashboard' | 'editor' | 'ats' | 'templates' | 'drafts';
export type MobileTab = 'dashboard' | 'editor' | 'ats' | 'templates' | 'preview';

export type BulletTone = 'impact' | 'leadership' | 'concise' | 'clarity';

export type AiEnhancerMode = 'rewrite_bullet' | 'improve_wording';

export interface EnhancedBulletVariation {
  toneLabel: string;
  actionVerb: string;
  text: string;
  metricsAdded: string;
  factsPreservedNote?: string;
}

export interface SummaryVariation {
  styleLabel: string;
  summaryText: string;
  groundedFactsUsed: string;
}

export type SkillCategory =
  | 'Core Technical'
  | 'Domain & Tools'
  | 'Transferable & Process';

export interface SuggestedSkillItem {
  skill: string;
  category: SkillCategory;
  reason: string;
}

export interface AiUsageMetadata {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  activeModel?: string;
  activeModelLabel?: string;
  switchedFromModel?: string;
  autoSwitchEnabled?: boolean;
}

export interface WholeResumeContextSnapshot {
  jobTitle?: string;
  summary?: string;
  skills?: string[];
  experience?: {
    role?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }[];
  projects?: {
    name?: string;
    subtitle?: string;
    bullets?: string[];
  }[];
  education?: {
    degree?: string;
    field?: string;
    institution?: string;
  }[];
  certifications?: {
    name?: string;
    issuer?: string;
  }[];
  jobDescriptionDraft?: string;
}

export interface WholeResumeBulletUpgrade {
  id: string;
  section: 'experience' | 'projects';
  itemId: string;
  bulletIndex: number;
  contextLabel: string;
  original: string;
  improved: string;
  changeSummary: string;
}

export interface WholeResumePolishResult {
  improvedSummary: string;
  summaryReasoning: string;
  bulletUpgrades: WholeResumeBulletUpgrade[];
  recommendedSkills: SuggestedSkillItem[];
  alignmentHighlights: string[];
}

export function resolveResumeColors(resume: ResumeDraft): CustomColors {
  const primary = resume.customColors?.primary || resume.accentColor || '#6D5CE8';
  const accent =
    resume.customColors?.accent ||
    (primary.toLowerCase() === '#6d5ce8' ? '#18B89A' : primary);
  const heading = resume.customColors?.heading || '#18181B';
  return {
    primary,
    accent,
    heading,
    paletteId: resume.customColors?.paletteId,
  };
}
