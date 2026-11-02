import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  ArrowRight,
  FileEdit,
  ShieldCheck,
  Target,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  getBreadcrumbJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'ATS Resume Guides, Action Verbs & Career Blog',
  description:
    'Expert guides on passing Applicant Tracking Systems (ATS), writing quantified resume bullets, matching job description keywords, and formatting A4 CVs.',
  keywords: [
    'ATS resume guide',
    'how to pass ATS screening',
    'quantified resume bullet points',
    'job description keyword matching guide',
    'A4 resume formatting tips',
    'VitaeFlow career blog',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'ATS Resume Guides, Action Verbs & Career Blog | VitaeFlow',
    description:
      'Expert guides on passing Applicant Tracking Systems (ATS), writing quantified resume bullets, matching job description keywords, and formatting A4 CVs.',
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATS Resume Guides, Action Verbs & Career Blog | VitaeFlow',
    description:
      'Expert guides on passing Applicant Tracking Systems (ATS), writing quantified resume bullets, matching job description keywords, and formatting A4 CVs.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function BlogIndexPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Career & ATS Guides', path: '/blog' },
  ]);

  return (
    <main className="flex-1 bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-[1440px] mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-medium text-slate-500 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-[#6D5CE8] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#18181B] font-semibold">
            ATS & Resume Writing Guides
          </span>
        </nav>

        {/* Hero Banner */}
        <header className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5CE8]">
              <BookOpen className="w-4 h-4 text-[#18B89A]" />
              <span>VitaeFlow Technical Career & ATS Knowledge Base</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18181B] text-balance">
              Practical Guides on ATS Parsing, Action-Verb Bullets & Job Keyword Matching
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              No fluff or fake &ldquo;guaranteed pass&rdquo; myths—just transparent engineering and recruiting best practices for building a high-signal A4 resume.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/resume-builder"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              <FileEdit className="w-4 h-4" />
              <span>Open AI Resume Builder</span>
            </Link>
            <Link
              href="/ats-checker"
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#18B89A] bg-white text-xs sm:text-sm font-semibold text-[#18181B] transition-all inline-flex items-center gap-2 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#18B89A]" />
              <span>Free ATS Check</span>
            </Link>
          </div>
        </header>

        {/* Articles Grid */}
        <section
          aria-label="Career and ATS optimization articles"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="bg-white border border-slate-200 hover:border-[#6D5CE8]/45 rounded-3xl p-6 sm:p-8 shadow-xs transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-[#6D5CE8]/10 text-[#6D5CE8] font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#18B89A]" />
                      {post.readingTime}
                    </span>
                    <time dateTime={post.updatedAt}>{post.updatedAt}</time>
                  </div>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#18181B] hover:text-[#6D5CE8] transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.keywords.slice(0, 3).map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs sm:text-sm font-bold text-[#6D5CE8] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={post.primaryToolHref}
                  className="text-xs font-semibold text-slate-600 hover:text-[#18181B] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  {post.primaryToolLabel} →
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Internal Tool Directory Banner for Crawlers & Users */}
        <section
          aria-labelledby="blog-tools-cta"
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#18B89A]">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Put These Guides Into Practice</span>
            </div>
            <h2
              id="blog-tools-cta"
              className="font-display text-xl sm:text-2xl font-bold text-[#18181B]"
            >
              Apply Every Best Practice Inside the VitaeFlow Workspace
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/resume-builder"
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-[#F8FAFC] hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#18181B]">
                <FileEdit className="w-4 h-4 text-[#6D5CE8]" />
                <span>AI Resume Builder</span>
              </div>
              <p className="text-xs text-slate-600">
                8-section editor with fact-safe Gemini bullet rewriting.
              </p>
            </Link>

            <Link
              href="/ats-checker"
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#18B89A] bg-[#F8FAFC] hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#18181B]">
                <ShieldCheck className="w-4 h-4 text-[#18B89A]" />
                <span>ATS Quality Checker</span>
              </div>
              <p className="text-xs text-slate-600">
                Audit section completeness, formatting rules, and metrics.
              </p>
            </Link>

            <Link
              href="/job-matcher"
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#6D5CE8] bg-[#F8FAFC] hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#18181B]">
                <Target className="w-4 h-4 text-[#6D5CE8]" />
                <span>Target Job Matcher</span>
              </div>
              <p className="text-xs text-slate-600">
                Compare your resume against any pasted job description.
              </p>
            </Link>

            <Link
              href="/templates"
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#18B89A] bg-[#F8FAFC] hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#18181B]">
                <LayoutTemplate className="w-4 h-4 text-[#18B89A]" />
                <span>A4 Template Studio</span>
              </div>
              <p className="text-xs text-slate-600">
                Switch between 6 ATS-friendly layouts and export 1:1 PDF.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
