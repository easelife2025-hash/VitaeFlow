import {
  ResumeDraft,
  DeterministicAtsReport,
  SectionCompletenessItem,
  FormattingWarningItem,
  EditorSectionId,
} from './types';

const WEAK_STARTERS = [
  'responsible for',
  'helped',
  'worked on',
  'assisted',
  'duties included',
  'tasked with',
  'in charge of',
  'participated in',
];

const KNOWN_TECH_AND_DOMAIN_TERMS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Angular',
  'Vue',
  'Node.js',
  'Python',
  'Go',
  'Java',
  'SQL',
  'PostgreSQL',
  'GraphQL',
  'REST',
  'Tailwind CSS',
  'CSS',
  'HTML',
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'GitHub Actions',
  'Playwright',
  'Jest',
  'Cypress',
  'WCAG',
  'Accessibility',
  'Core Web Vitals',
  'System Design',
  'Microservices',
  'Redis',
  'Kafka',
  'Design Systems',
  'Figma',
  'Product Strategy',
  'Roadmapping',
  'A/B Testing',
  'Agile',
  'Scrum',
  'Cross-Functional',
  'Mentorship',
  'Performance Optimization',
  'Machine Learning',
  'LLM',
  'Data Visualization',
  'Observability',
  'Security',
  'OAuth',
];

const STOPWORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'your',
  'have',
  'will',
  'work',
  'team',
  'role',
  'years',
  'experience',
  'building',
  'using',
  'strong',
  'ability',
  'including',
  'across',
  'within',
  'about',
  'their',
  'other',
  'more',
  'into',
  'such',
  'able',
  'must',
  'plus',
  'preferred',
  'qualifications',
  'responsibilities',
  'requirements',
  'deliver',
  'partner',
  'collaborate',
  'maintain',
  'design',
  'build',
  'develop',
  'support',
  'ensure',
  'drive',
  'lead',
  'high',
  'scale',
  'modern',
  'proven',
  'deep',
  'extensive',
]);

export const SECTION_LABELS: Record<EditorSectionId, string> = {
  personal: 'Personal Details',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
};

function buildFullResumeCorpus(resume: ResumeDraft): string {
  const parts: string[] = [
    resume.personalInfo.fullName,
    resume.personalInfo.jobTitle,
    resume.personalInfo.summary,
    ...resume.skills,
    ...resume.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...resume.education.flatMap((ed) => [ed.institution, ed.degree, ed.field]),
    ...resume.projects.flatMap((p) => [p.name, p.subtitle, ...p.bullets]),
    ...(resume.certifications || []).flatMap((c) => [c.name, c.issuer]),
    ...(resume.languages || []).map((l) => l.language),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function extractKeywordsFromJobDescription(jdText: string): string[] {
  if (!jdText || !jdText.trim()) return [];
  const lowerJd = jdText.toLowerCase();
  const extracted: string[] = [];
  const seen = new Set<string>();

  // 1. Check known curated technical, product, and methodology terms
  for (const term of KNOWN_TECH_AND_DOMAIN_TERMS) {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lowerJd)) {
      const key = term.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        extracted.push(term);
      }
    }
  }

  // 2. Extract capitalized technical / domain tokens from the JD
  const rawTokens = jdText.match(/\b[A-Za-z][A-Za-z0-9+.#/-]{2,24}\b/g) || [];
  for (const token of rawTokens) {
    const clean = token.replace(/[.,;:()]+$/, '');
    const lower = clean.toLowerCase();
    if (
      clean.length >= 3 &&
      !STOPWORDS.has(lower) &&
      !seen.has(lower) &&
      (/^[A-Z]/.test(clean) || /[+#./]/.test(clean))
    ) {
      seen.add(lower);
      extracted.push(clean);
    }
    if (extracted.length >= 22) break;
  }

  return extracted.slice(0, 20);
}

export function evaluateResumeDeterministically(
  resume: ResumeDraft,
  jobDescription?: string
): DeterministicAtsReport {
  const sectionChecks: SectionCompletenessItem[] = [];
  const formattingWarnings: FormattingWarningItem[] = [];

  // 1. Personal Details Check (Max 15 pts)
  const p = resume.personalInfo;
  const hasName = Boolean(p.fullName?.trim());
  const hasTitle = Boolean(p.jobTitle?.trim());
  const hasEmail = Boolean(p.email?.trim() && p.email.includes('@'));
  const hasPhone = Boolean(p.phone?.trim());
  const hasLocation = Boolean(p.location?.trim());
  const hasLinkedinOrWeb = Boolean(p.linkedin?.trim() || p.website?.trim());

  let personalPts = 0;
  if (hasName) personalPts += 3;
  if (hasTitle) personalPts += 3;
  if (hasEmail) personalPts += 3;
  if (hasPhone) personalPts += 2;
  if (hasLocation) personalPts += 2;
  if (hasLinkedinOrWeb) personalPts += 2;

  const missingPersonalFields: string[] = [];
  if (!hasName) missingPersonalFields.push('Full Name');
  if (!hasTitle) missingPersonalFields.push('Target Role');
  if (!hasEmail) missingPersonalFields.push('Email');
  if (!hasPhone) missingPersonalFields.push('Phone');
  if (!hasLocation) missingPersonalFields.push('Location');
  if (!hasLinkedinOrWeb) missingPersonalFields.push('LinkedIn/Portfolio');

  sectionChecks.push({
    sectionId: 'personal',
    label: 'Personal Details',
    status:
      personalPts >= 13
        ? 'complete'
        : personalPts >= 7
          ? 'partial'
          : 'missing',
    earnedPoints: personalPts,
    maxPoints: 15,
    summary:
      missingPersonalFields.length === 0
        ? 'All core contact fields and target role headline are present.'
        : `Missing: ${missingPersonalFields.join(', ')}.`,
    recommendation:
      missingPersonalFields.length > 0
        ? `Add ${missingPersonalFields.join(', ')} so ATS parsers can index your contact header.`
        : undefined,
  });

  if (missingPersonalFields.length > 0) {
    formattingWarnings.push({
      id: 'warn-personal-missing',
      severity: !hasEmail || !hasPhone ? 'warning' : 'info',
      title: 'Incomplete Contact Header',
      detail: `Your header is missing ${missingPersonalFields.join(', ')}. ATS systems rely on standard email, phone, and location fields.`,
      targetSection: 'personal',
    });
  }

  // 2. Professional Summary Check (Max 15 pts)
  const summaryLen = (p.summary || '').trim().length;
  let summaryPts = 0;
  if (summaryLen >= 160 && summaryLen <= 520) {
    summaryPts = 15;
  } else if (summaryLen >= 70) {
    summaryPts = 10;
  } else if (summaryLen > 0) {
    summaryPts = 5;
  }

  sectionChecks.push({
    sectionId: 'summary',
    label: 'Professional Summary',
    status:
      summaryPts === 15
        ? 'complete'
        : summaryPts > 0
          ? 'partial'
          : 'missing',
    earnedPoints: summaryPts,
    maxPoints: 15,
    summary:
      summaryLen === 0
        ? 'No professional summary written yet.'
        : `${summaryLen} characters (optimal range: 160–480 characters).`,
    recommendation:
      summaryLen < 160
        ? 'Expand your summary to 2–3 sentences covering your role, years of experience, and core domain.'
        : summaryLen > 520
          ? 'Tighten your summary under 480 characters so recruiters can scan it in 5 seconds.'
          : undefined,
  });

  if (summaryLen > 0 && (summaryLen < 140 || summaryLen > 520)) {
    formattingWarnings.push({
      id: 'warn-summary-length',
      severity: 'info',
      title:
        summaryLen < 140
          ? 'Summary Is Too Brief'
          : 'Summary Exceeds Recommended Length',
      detail:
        summaryLen < 140
          ? `Your summary is ${summaryLen} chars. Aim for 160–450 chars to provide sufficient role context.`
          : `Your summary is ${summaryLen} chars. Consider trimming below 480 chars for faster scanning.`,
      targetSection: 'summary',
    });
  }

  // 3. Work Experience Check (Max 30 pts)
  const expCount = resume.experience.length;
  const allExpBullets = resume.experience.flatMap((e) =>
    e.bullets.map((b) => b.trim()).filter(Boolean)
  );
  const quantifiedBullets = allExpBullets.filter((b) =>
    /\b(\d+%|\$\d+|\d+x|\d+\+|\d+[kKmM]?\b)/.test(b)
  ).length;
  const weakBullets = allExpBullets.filter((b) => {
    const lower = b.toLowerCase();
    return WEAK_STARTERS.some((w) => lower.startsWith(w));
  });
  const shortBullets = allExpBullets.filter((b) => b.length > 0 && b.length < 45);
  const longBullets = allExpBullets.filter((b) => b.length > 240);

  let expPts = 0;
  if (expCount >= 2 && allExpBullets.length >= 4) {
    expPts = 30;
  } else if (expCount >= 1 && allExpBullets.length >= 2) {
    expPts = 20;
  } else if (expCount >= 1) {
    expPts = 10;
  }

  sectionChecks.push({
    sectionId: 'experience',
    label: 'Work Experience',
    status: expPts >= 25 ? 'complete' : expPts > 0 ? 'partial' : 'missing',
    earnedPoints: expPts,
    maxPoints: 30,
    summary:
      expCount === 0
        ? 'No work experience entries added.'
        : `${expCount} role(s) with ${allExpBullets.length} achievement bullets (${quantifiedBullets} with measurable numbers).`,
    recommendation:
      expCount === 0
        ? 'Add your relevant work history with 3–4 impact bullets per role.'
        : allExpBullets.length < 4
          ? 'Add more descriptive bullet points detailing what you built, led, or improved.'
          : undefined,
  });

  if (weakBullets.length > 0) {
    formattingWarnings.push({
      id: 'warn-weak-verbs',
      severity: 'warning',
      title: `${weakBullets.length} Bullet(s) Start with Passive Phrasing`,
      detail: `Avoid starting bullets with phrases like "Responsible for" or "Helped". Lead with strong action verbs such as Architected, Led, Optimized, or Delivered.`,
      targetSection: 'experience',
    });
  }

  if (shortBullets.length > 0 || longBullets.length > 0) {
    formattingWarnings.push({
      id: 'warn-bullet-length',
      severity: 'info',
      title: 'Bullet Point Length Formatting',
      detail: `${
        shortBullets.length > 0
          ? `${shortBullets.length} bullet(s) are under 45 characters and lack context. `
          : ''
      }${
        longBullets.length > 0
          ? `${longBullets.length} bullet(s) exceed 240 characters and may wrap awkwardly on A4 pages.`
          : ''
      }`.trim(),
      targetSection: 'experience',
    });
  }

  const rolesMissingDates = resume.experience.filter(
    (e) => !e.startDate?.trim() || (!e.current && !e.endDate?.trim())
  );
  if (rolesMissingDates.length > 0) {
    formattingWarnings.push({
      id: 'warn-exp-dates',
      severity: 'warning',
      title: 'Missing Employment Dates',
      detail: `${rolesMissingDates.length} experience entry is missing a start or end date. Standard "Mon YYYY – Present" formatting prevents ATS timeline errors.`,
      targetSection: 'experience',
    });
  }

  // 4. Education Check (Max 10 pts)
  const eduCount = resume.education.length;
  const validEdu = resume.education.filter(
    (ed) => ed.institution?.trim() && ed.degree?.trim()
  ).length;
  const eduPts = validEdu >= 1 ? 10 : eduCount >= 1 ? 5 : 0;

  sectionChecks.push({
    sectionId: 'education',
    label: 'Education',
    status: eduPts === 10 ? 'complete' : eduPts > 0 ? 'partial' : 'missing',
    earnedPoints: eduPts,
    maxPoints: 10,
    summary:
      eduCount === 0
        ? 'No education entries listed.'
        : `${eduCount} academic entry listed.`,
    recommendation:
      eduPts < 10
        ? 'Ensure institution name, degree, field of study, and graduation year are filled in.'
        : undefined,
  });

  // 5. Skills Check (Max 15 pts)
  const skillCount = resume.skills.length;
  const skillPts =
    skillCount >= 8 ? 15 : skillCount >= 4 ? 10 : skillCount > 0 ? 5 : 0;

  sectionChecks.push({
    sectionId: 'skills',
    label: 'Skills',
    status: skillPts === 15 ? 'complete' : skillPts > 0 ? 'partial' : 'missing',
    earnedPoints: skillPts,
    maxPoints: 15,
    summary: `${skillCount} skill(s) listed (recommended: 8–16 core skills).`,
    recommendation:
      skillCount < 8
        ? 'Add at least 8 core technical, domain, or methodology skills that you genuinely possess.'
        : undefined,
  });

  if (skillCount < 6) {
    formattingWarnings.push({
      id: 'warn-skills-count',
      severity: 'warning',
      title: 'Low Skill Keyword Density',
      detail: `You currently list ${skillCount} skill(s). Adding 8–14 genuine technical and domain skills improves ATS keyword indexing.`,
      targetSection: 'skills',
    });
  }

  // 6. Projects Check (Max 5 pts)
  const projCount = resume.projects.length;
  const projPts = projCount >= 1 ? 5 : 0;
  sectionChecks.push({
    sectionId: 'projects',
    label: 'Projects',
    status: projPts === 5 ? 'complete' : 'missing',
    earnedPoints: projPts,
    maxPoints: 5,
    summary:
      projCount > 0
        ? `${projCount} project case study included.`
        : 'No projects added (optional but helpful for technical/product roles).',
    recommendation:
      projCount === 0
        ? 'Add 1–2 notable projects or technical builds to reinforce your hands-on skills.'
        : undefined,
  });

  // 7. Certifications Check (Max 5 pts)
  const certs = resume.certifications || [];
  const certPts = certs.length >= 1 ? 5 : 0;
  sectionChecks.push({
    sectionId: 'certifications',
    label: 'Certifications',
    status: certPts === 5 ? 'complete' : 'missing',
    earnedPoints: certPts,
    maxPoints: 5,
    summary:
      certs.length > 0
        ? `${certs.length} certification(s) listed.`
        : 'No certifications listed (optional).',
    recommendation:
      certs.length === 0
        ? 'Include any verified licenses or industry certifications you hold.'
        : undefined,
  });

  // 8. Languages Check (Max 5 pts)
  const langs = resume.languages || [];
  const langPts = langs.length >= 1 ? 5 : 0;
  sectionChecks.push({
    sectionId: 'languages',
    label: 'Languages',
    status: langPts === 5 ? 'complete' : 'missing',
    earnedPoints: langPts,
    maxPoints: 5,
    summary:
      langs.length > 0
        ? `${langs.length} language(s) with proficiency level listed.`
        : 'No languages listed (optional).',
    recommendation:
      langs.length === 0
        ? 'Add spoken/written languages and proficiency levels.'
        : undefined,
  });

  // Compute deterministic scores
  const completenessScore = sectionChecks.reduce(
    (sum, item) => sum + item.earnedPoints,
    0
  );

  // Formatting score starts at 100 and deducts per deterministic warning
  let formattingDeductions = 0;
  for (const w of formattingWarnings) {
    formattingDeductions += w.severity === 'warning' ? 12 : 6;
  }
  const formattingScore = Math.max(40, 100 - formattingDeductions);

  // Deterministic JD Keyword Matching
  const resumeCorpus = buildFullResumeCorpus(resume);
  const extractedJdTerms = extractKeywordsFromJobDescription(
    jobDescription || resume.jobDescriptionDraft || ''
  );

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const term of extractedJdTerms) {
    const lowerTerm = term.toLowerCase();
    if (resumeCorpus.includes(lowerTerm)) {
      matchedKeywords.push(term);
    } else {
      missingKeywords.push(term);
    }
  }

  const keywordCoverageScore =
    extractedJdTerms.length > 0
      ? Math.round((matchedKeywords.length / extractedJdTerms.length) * 100)
      : Math.min(95, skillCount * 8);

  const estimatedQualityScore = Math.round(
    completenessScore * 0.4 +
      formattingScore * 0.25 +
      keywordCoverageScore * 0.35
  );

  return {
    estimatedQualityScore: Math.max(15, Math.min(98, estimatedQualityScore)),
    completenessScore,
    formattingScore,
    keywordCoverageScore,
    sectionChecks,
    formattingWarnings,
    matchedKeywords,
    missingKeywords,
    totalBullets: allExpBullets.length,
    quantifiedBullets,
    strongVerbBullets: Math.max(0, allExpBullets.length - weakBullets.length),
  };
}
