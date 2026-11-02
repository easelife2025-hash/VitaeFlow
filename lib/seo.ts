/**
 * Centralized SEO, Canonical Domain, Keyword & Schema.org JSON-LD Configuration
 * for VitaeFlow AI Resume Builder.
 *
 * Uses the actual production domain injected at runtime or falls back to the deployed Cloud Run URL.
 * Never invents fake reviews, ratings, or unverified company addresses.
 */

export const PRODUCTION_DOMAIN =
  'https://ais-pre-6zm5vnqncwnbaa5e6ujfbf-641782429565.asia-southeast1.run.app';

export function getSiteUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    PRODUCTION_DOMAIN;
  return rawUrl.replace(/\/+$/, '');
}

export const SITE_URL = getSiteUrl();
export const SITE_NAME = 'VitaeFlow';
export const SITE_FULL_NAME = 'VitaeFlow AI Resume Builder';

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: 'VitaeFlow – AI Resume Builder, ATS Quality Checker & Job Keyword Matcher',
};

export const CORE_KEYWORDS: string[] = [
  'AI resume builder',
  'ATS resume checker',
  'free ATS resume audit',
  'job description keyword matcher',
  'ATS friendly resume templates',
  'A4 resume builder PDF',
  'AI resume bullet point generator',
  'resume keyword scanner',
  'professional CV maker online',
  'VitaeFlow',
];

/**
 * Generates Schema.org WebSite & Organization JSON-LD for global brand & search discovery.
 */
export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_FULL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    description:
      'Build an ATS-friendly resume in minutes with VitaeFlow. Features AI bullet rewriting, live A4 templates, job keyword matching, and instant PDF export.',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Generates Schema.org WebApplication JSON-LD for SaaS / tool discovery in Google & AI search.
 * Strictly factual—no invented ratings or review counts.
 */
export function getWebApplicationJsonLd(params?: {
  name?: string;
  url?: string;
  description?: string;
  featureList?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: params?.name || SITE_FULL_NAME,
    url: params?.url || SITE_URL,
    description:
      params?.description ||
      'AI Resume Builder, Deterministic 8-Section ATS Quality Checker, Target Job Description Keyword Matcher, and 1:1 Vector A4 PDF Template Studio.',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Resume Builder & Career Software',
    operatingSystem: 'Web, All Modern Browsers',
    browserRequirements: 'Requires JavaScript and modern HTML5 browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: params?.featureList || [
      '8-Section Structured AI Resume Builder',
      'Fact-Preserving Gemini Action-Verb Bullet Rewriter',
      'Deterministic 8-Section ATS Completeness & Formatting Audit',
      'Target Job Description Keyword Comparison & AI Advisor',
      '6 Switchable Designer A4 Resume Templates with Live Preview',
      '1:1 Selectable Vector A4 PDF Export',
    ],
  };
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD for clean hierarchy in search snippets.
 */
export function getBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http')
        ? item.path
        : `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question:
      'Are VitaeFlow resumes compatible with Applicant Tracking Systems (ATS)?',
    answer:
      'Yes. VitaeFlow renders clean semantic typography and exports 100% selectable vector text via our dedicated A4 PDF engine—ensuring applicant tracking systems parse every heading, date, and achievement bullet accurately. Note that while we optimize structure and keyword alignment, no tool can guarantee an automated ATS pass.',
  },
  {
    question:
      'How are the ATS Checker (/ats-checker) and Job Matcher (/job-matcher) separated?',
    answer:
      'The ATS Checker page focuses on auditing your resume’s intrinsic quality—scoring 8-section completeness, formatting rules, action verbs, and measurable metrics. The Job Matcher page lets you paste a target job description to compare matched vs. missing keywords and generate contextual Gemini advice.',
  },
  {
    question:
      'Does the AI Resume Builder ever invent fake experience or metrics?',
    answer:
      'Never. Every server-side Gemini endpoint (/api/ai/*) enforces strict fact-preservation rules. It polishes action verbs, clarity, and structure using only the facts present in your resume, and shows all variations in a review modal before you apply them.',
  },
  {
    question:
      'Can I switch between resume templates without losing my content?',
    answer:
      'Yes. Your resume drafts are stored independently from visual styling. Visit the Templates page (/templates) anytime to switch between Modern Accent, Executive Minimal, and Split Column layouts—and download an exact 1:1 matching A4 PDF.',
  },
  {
    question:
      'Where are my resumes stored, and how do I manage my AI usage limits?',
    answer:
      'Your resume drafts are automatically saved locally in your browser storage. On the Settings page (/settings), you can adjust your hourly AI request rate limit, set default template preferences, export a full JSON backup archive, or clear local storage.',
  },
];

/**
 * Generates Schema.org FAQPage JSON-LD matching visible FAQ questions on the page.
 */
export function getFaqJsonLd(
  faqs: { question: string; answer: string }[] = FAQ_ITEMS
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
