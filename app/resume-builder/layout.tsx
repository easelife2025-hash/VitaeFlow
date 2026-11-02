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
  title: 'AI Resume Builder & Live A4 CV Maker',
  description:
    'Create and customize your professional resume with VitaeFlow’s 8-section AI editor, action-verb bullet enhancer, skill suggestions, and 1:1 A4 PDF export.',
  keywords: [
    'AI resume builder',
    'online CV maker A4',
    'AI resume bullet point rewriter',
    '8 section resume editor',
    'fact safe AI resume generator',
    'professional resume PDF export',
  ],
  alternates: {
    canonical: `${SITE_URL}/resume-builder`,
  },
  openGraph: {
    title: 'AI Resume Builder & Live A4 CV Maker | VitaeFlow',
    description:
      'Create and customize your professional resume with VitaeFlow’s 8-section AI editor, action-verb bullet enhancer, skill suggestions, and 1:1 A4 PDF export.',
    url: `${SITE_URL}/resume-builder`,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder & Live A4 CV Maker | VitaeFlow',
    description:
      'Create and customize your professional resume with VitaeFlow’s 8-section AI editor, action-verb bullet enhancer, skill suggestions, and 1:1 A4 PDF export.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'AI Resume Builder', path: '/resume-builder' },
  ]);

  const toolJsonLd = getWebApplicationJsonLd({
    name: 'VitaeFlow AI Resume Builder Studio',
    url: `${SITE_URL}/resume-builder`,
    description:
      'Structured 8-section AI resume builder with fact-preserving Gemini bullet rewriting, optional profile photo framing, custom color palettes, and 1:1 A4 vector PDF export.',
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
      {/* Server-rendered semantic context for search & AI crawlers */}
      <section
        aria-label="About the VitaeFlow AI Resume Builder"
        className="sr-only"
      >
        <h2>Structured 8-Section AI Resume Builder & Live A4 CV Studio</h2>
        <p>
          Build an ATS-compatible professional resume across eight dedicated
          sections: Personal Details, Professional Summary, Work Experience,
          Education, Skills, Key Projects, Certifications, and Languages. Use
          our server-side Gemini AI Bullet Rewriter to polish achievement
          statements without inventing fake credentials or metrics, then export
          an exact 1:1 selectable vector A4 PDF.
        </p>
        <nav aria-label="Related VitaeFlow tools">
          <Link href="/ats-checker">Free ATS Resume Checker</Link>
          <Link href="/job-matcher">Job Description Keyword Matcher</Link>
          <Link href="/templates">A4 Resume Templates</Link>
          <Link href="/blog">ATS & Resume Writing Guides</Link>
        </nav>
      </section>
    </>
  );
}
