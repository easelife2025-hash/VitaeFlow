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
  title: 'Free ATS Resume Checker & Formatting Audit',
  description:
    'Check your resume’s ATS compatibility score instantly. Audit section structure, contact details, measurable impact metrics, and formatting issues for free.',
  keywords: [
    'free ATS resume checker',
    'ATS resume score audit',
    'resume formatting checker',
    'applicant tracking system resume test',
    'resume section completeness check',
    'quantified resume bullet audit',
  ],
  alternates: {
    canonical: `${SITE_URL}/ats-checker`,
  },
  openGraph: {
    title: 'Free ATS Resume Checker & Formatting Audit | VitaeFlow',
    description:
      'Check your resume’s ATS compatibility score instantly. Audit section structure, contact details, measurable impact metrics, and formatting issues for free.',
    url: `${SITE_URL}/ats-checker`,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ATS Resume Checker & Formatting Audit | VitaeFlow',
    description:
      'Check your resume’s ATS compatibility score instantly. Audit section structure, contact details, measurable impact metrics, and formatting issues for free.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function AtsCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Free ATS Resume Checker', path: '/ats-checker' },
  ]);

  const toolJsonLd = getWebApplicationJsonLd({
    name: 'VitaeFlow Deterministic ATS Resume Checker',
    url: `${SITE_URL}/ats-checker`,
    description:
      'Audit your resume against measurable Applicant Tracking System rules, including 8-section completeness, contact header parseability, action-verb ratio, and quantified bullet density.',
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
        aria-label="About the VitaeFlow ATS Quality Checker"
        className="sr-only"
      >
        <h2>Deterministic 8-Section ATS Resume Quality & Formatting Auditor</h2>
        <p>
          Inspect your resume’s structural readiness for Applicant Tracking
          Systems. Evaluates contact header completeness, professional summary
          length, chronological date formatting, strong action verbs, and
          quantified impact metrics with direct deep links to fix warnings in
          the AI Resume Builder.
        </p>
        <nav aria-label="Related VitaeFlow tools">
          <Link href="/resume-builder">AI Resume Builder</Link>
          <Link href="/job-matcher">Job Description Keyword Matcher</Link>
          <Link href="/templates">A4 Resume Templates</Link>
          <Link href="/blog/how-to-pass-ats-resume-screening">
            How ATS Resume Screening Works Guide
          </Link>
        </nav>
      </section>
    </>
  );
}
