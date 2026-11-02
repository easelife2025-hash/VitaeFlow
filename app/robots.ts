import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const PUBLIC_ALLOWED_PATHS = [
  '/',
  '/resume-builder',
  '/ats-checker',
  '/job-matcher',
  '/templates',
  '/blog',
  '/llms.txt',
  '/opengraph-image',
  '/twitter-image',
  '/_next/static/',
  '/_next/image/',
  '/images/',
  '/videos/',
];

const PRIVATE_DISALLOWED_PATHS = ['/dashboard', '/settings', '/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: PUBLIC_ALLOWED_PATHS,
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: PUBLIC_ALLOWED_PATHS,
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      {
        // Configured separately so site owners can independently manage OpenAI model training vs. search indexing
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/resume-builder',
          '/ats-checker',
          '/job-matcher',
          '/templates',
          '/blog',
          '/llms.txt',
        ],
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      {
        userAgent: ['PerplexityBot', 'ClaudeBot', 'Applebot-Extended'],
        allow: PUBLIC_ALLOWED_PATHS,
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      {
        userAgent: '*',
        allow: PUBLIC_ALLOWED_PATHS,
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
