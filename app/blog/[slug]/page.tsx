import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blog-data';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  getBreadcrumbJsonLd,
} from '@/lib/seo';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: true },
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.seoTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.seoTitle} | ${SITE_NAME}`,
      description: post.metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.seoTitle} | ${SITE_NAME}`,
      description: post.metaDescription,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug);

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Career & ATS Guides', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-500"
        >
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#6D5CE8] transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/blog"
              className="hover:text-[#6D5CE8] transition-colors"
            >
              Career & ATS Guides
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#18181B] font-semibold truncate max-w-[240px] sm:max-w-md">
              {post.title}
            </span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[#6D5CE8] font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Guides</span>
          </Link>
        </nav>

        {/* Main Article Container */}
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <header className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#6D5CE8]/10 text-[#6D5CE8] font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-[#18B89A]" />
                {post.readingTime}
              </span>
              <span className="text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-500">
                Updated <time dateTime={post.updatedAt}>{post.updatedAt}</time>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#18181B] leading-tight text-balance">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Primary Tool Action Strip */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#18181B]">
                <Sparkles className="w-4 h-4 text-[#6D5CE8] shrink-0" />
                <span>Ready to apply this guide directly to your resume?</span>
              </div>
              <Link
                href={post.primaryToolHref}
                className="min-h-[38px] px-4 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{post.primaryToolLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Table of Contents */}
          <nav
            aria-label="Table of contents"
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              In This Guide
            </span>
            <ol className="space-y-1.5 text-xs sm:text-sm font-medium text-[#6D5CE8]">
              {post.sections.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="hover:underline">
                    {sec.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Article Sections */}
          <div className="space-y-8">
            {post.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="space-y-4 scroll-mt-24"
              >
                <h2 className="font-display text-lg sm:text-2xl font-bold text-[#18181B]">
                  {section.heading}
                </h2>

                {section.paragraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm sm:text-base text-slate-700 leading-relaxed"
                  >
                    {para}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2.5 pl-1 pt-1">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.exampleBefore && section.exampleAfter && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Before (Passive Duty)
                      </span>
                      <p className="text-xs sm:text-sm text-slate-500 line-through">
                        {section.exampleBefore}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#6D5CE8]/[0.05] border border-[#6D5CE8]/25 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D5CE8]">
                        After (Quantified Action Verb)
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#18181B]">
                        {section.exampleAfter}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Bottom Conversion Box */}
          <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#18B89A]">
                Free Online Workspace · No Sign-Up Required to Start
              </span>
              <h3 className="font-display text-lg font-bold text-[#18181B]">
                Test Your Resume Inside VitaeFlow Today
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={post.primaryToolHref}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2"
              >
                <span>{post.primaryToolLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resume-builder"
                className="min-h-[42px] px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#18181B] transition-all"
              >
                AI Resume Builder
              </Link>
            </div>
          </footer>
        </article>

        {/* Related Guides */}
        <section aria-label="More career and ATS guides" className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#18181B] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#6D5CE8]" />
            <span>More ATS & Resume Guides</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="bg-white border border-slate-200 hover:border-[#6D5CE8]/45 rounded-2xl p-5 shadow-2xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D5CE8]">
                    {rel.category}
                  </span>
                  <h3 className="font-display text-sm font-bold text-[#18181B] line-clamp-2">
                    {rel.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#6D5CE8] inline-flex items-center gap-1">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
