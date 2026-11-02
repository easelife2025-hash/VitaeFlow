import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import PopularEmployersSection from '@/components/PopularEmployersSection';
import FeatureCardsSection from '@/components/FeatureCardsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import LandingInteractiveDemo from '@/components/LandingInteractiveDemo';
import LandingTestimonialsAndTrust from '@/components/LandingTestimonialsAndTrust';
import FaqSection from '@/components/FaqSection';
import {
  SITE_URL,
  SITE_FULL_NAME,
  CORE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  FAQ_ITEMS,
  getFaqJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: 'VitaeFlow – AI Resume Builder, ATS Checker & Job Matcher',
  },
  description:
    'Build an ATS-friendly resume in minutes with VitaeFlow. Features AI bullet rewriting, live A4 templates, job keyword matching, and instant PDF export.',
  keywords: CORE_KEYWORDS,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'VitaeFlow – AI Resume Builder, ATS Checker & Job Matcher',
    description:
      'Build an ATS-friendly resume in minutes with VitaeFlow. Features AI bullet rewriting, live A4 templates, job keyword matching, and instant PDF export.',
    url: SITE_URL,
    siteName: SITE_FULL_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VitaeFlow – AI Resume Builder, ATS Checker & Job Matcher',
    description:
      'Build an ATS-friendly resume in minutes with VitaeFlow. Features AI bullet rewriting, live A4 templates, job keyword matching, and instant PDF export.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function LandingPage() {
  const faqJsonLd = getFaqJsonLd(FAQ_ITEMS);

  return (
    <main className="flex-1 flex flex-col bg-[#F8FAFC] text-[#18181B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. Animated Hero Section with Looping Interview Video & Prominent CTAs */}
      <HeroSection />

      {/* 2. Trusted Target Companies Benchmark Section (Google, Microsoft, Amazon, Meta, Apple) */}
      <PopularEmployersSection />

      {/* 3. Animated Feature Showcase with UI Mockups */}
      <FeatureCardsSection />

      {/* 4. "How It Works" Section with Short Demonstration Video Stage */}
      <HowItWorksSection />

      {/* 6. Interactive ATS Checker & AI Resume Builder Demonstrations */}
      <LandingInteractiveDemo />

      {/* 7. Clearly Labelled Sample Candidate Stories, Trust Badges, Security & About Us */}
      <LandingTestimonialsAndTrust />

      {/* 8. FAQ & Final Conversion CTA */}
      <FaqSection />
    </main>
  );
}
