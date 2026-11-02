import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  getBreadcrumbJsonLd,
  getWebApplicationJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AI Job Description Keyword Matcher & Scanner',
  description:
    'Compare your resume against any target job description. Identify missing hard skills, boost keyword alignment, and tailor your CV before applying.',
  keywords: [
    'job description keyword matcher',
    'resume vs job description scanner',
    'missing resume keywords checker',
    'tailor resume to job description AI',
    'ATS keyword overlap tool',
  ],
  alternates: {
    canonical: `${SITE_URL}/job-matcher`,
  },
  openGraph: {
    title: 'AI Job Description Keyword Matcher & Scanner | VitaeFlow',
    description:
      'Compare your resume against any target job description. Identify missing hard skills, boost keyword alignment, and tailor your CV before applying.',
    url: `${SITE_URL}/job-matcher`,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Description Keyword Matcher & Scanner | VitaeFlow',
    description:
      'Compare your resume against any target job description. Identify missing hard skills, boost keyword alignment, and tailor your CV before applying.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function JobMatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Target Job Description Matcher', path: '/job-matcher' },
  ]);

  const toolJsonLd = getWebApplicationJsonLd({
    name: 'VitaeFlow Target Job Description Keyword Matcher',
    url: `${SITE_URL}/job-matcher`,
    description:
      'Compare your active resume against any pasted job posting to identify verified matched keywords, missing relevant skills, and fact-safe Gemini tailoring suggestions.',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      {children}
      <section
        aria-label="About the VitaeFlow Target Job Matcher"
        className="sr-only"
      >
        <h2>Resume vs. Job Description Keyword Comparison & AI Advisor</h2>
        <p>
          Paste any target job posting to compare required technical skills,
          domain competencies, and role keywords against your resume. View
          verified matched terms, add missing skills you genuinely possess with
          one click, and generate contextual Gemini tailoring advice.
        </p>
        <nav aria-label="Related VitaeFlow tools">
          <Link href="/resume-builder">AI Resume Builder</Link>
          <Link href="/ats-checker">Free ATS Resume Checker</Link>
          <Link href="/templates">A4 Resume Templates</Link>
          <Link href="/blog/tailor-resume-keywords-to-job-description">
            How to Match Resume Keywords Guide
          </Link>
        </nav>
      </section>
    </>
  );
}
