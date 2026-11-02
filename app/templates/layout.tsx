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
  title: 'ATS-Friendly A4 Resume Templates & CV Layouts',
  description:
    'Browse 6 recruiter-approved, ATS-parseable A4 resume templates. Customize fonts, accent colors, and professional layouts with live real-time preview.',
  keywords: [
    'ATS friendly resume templates',
    'A4 resume templates PDF',
    'modern executive resume layout',
    'split column technical CV template',
    'customizable resume templates online',
  ],
  alternates: {
    canonical: `${SITE_URL}/templates`,
  },
  openGraph: {
    title: 'ATS-Friendly A4 Resume Templates & CV Layouts | VitaeFlow',
    description:
      'Browse 6 recruiter-approved, ATS-parseable A4 resume templates. Customize fonts, accent colors, and professional layouts with live real-time preview.',
    url: `${SITE_URL}/templates`,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATS-Friendly A4 Resume Templates & CV Layouts | VitaeFlow',
    description:
      'Browse 6 recruiter-approved, ATS-parseable A4 resume templates. Customize fonts, accent colors, and professional layouts with live real-time preview.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Designer A4 Resume Templates', path: '/templates' },
  ]);

  const toolJsonLd = getWebApplicationJsonLd({
    name: 'VitaeFlow Designer A4 Resume Template Studio',
    url: `${SITE_URL}/templates`,
    description:
      'Switch seamlessly between Modern, Executive, Split Column, Creative, Professional, and Elegant A4 resume templates with custom color palettes, Google Fonts, and 1:1 vector PDF export.',
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
        aria-label="About the VitaeFlow A4 Template Studio"
        className="sr-only"
      >
        <h2>Six Switchable ATS-Parseable A4 Resume Templates</h2>
        <p>
          Compare Modern Accent, Executive Minimal, Split Column, Creative
          Studio, Professional Classic, and Elegant Editorial resume templates.
          Customize primary, accent, and heading colors, pair Google Fonts
          (Inter, Lato, Roboto, Playfair Display), and export a 100% selectable
          vector A4 PDF.
        </p>
        <nav aria-label="Related VitaeFlow tools">
          <Link href="/resume-builder">AI Resume Builder</Link>
          <Link href="/ats-checker">Free ATS Resume Checker</Link>
          <Link href="/job-matcher">Job Description Keyword Matcher</Link>
          <Link href="/blog/best-ats-friendly-a4-resume-format">
            Best A4 Resume Format Guide
          </Link>
        </nav>
      </section>
    </>
  );
}
