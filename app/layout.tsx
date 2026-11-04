import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ResumeProvider } from '@/context/ResumeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ProtectedRouteGate from '@/components/ProtectedRouteGate';
import {
  SITE_URL,
  SITE_NAME,
  SITE_FULL_NAME,
  CORE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  getWebsiteJsonLd,
  getWebApplicationJsonLd,
} from '@/lib/seo';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6D5CE8',
};

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VitaeFlow – AI Resume Builder, ATS Checker & Job Matcher',
    template: '%s | VitaeFlow',
  },
  description:
    'Build an ATS-friendly resume in minutes with VitaeFlow. Features AI bullet rewriting, live A4 templates, job keyword matching, and instant PDF export.',
  applicationName: SITE_FULL_NAME,
  keywords: CORE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Career & Resume Software',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-US': SITE_URL,
    },
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Lato:wght@400;700;900&family=Playfair+Display:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Roboto:wght@400;500;700&display=swap';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = getWebsiteJsonLd();
  const webAppJsonLd = getWebApplicationJsonLd();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#F8FAFC] text-[#18181B] antialiased selection:bg-[#6D5CE8]/15 selection:text-[#6D5CE8] min-h-screen flex flex-col"
      >
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <ResumeProvider>
          <Header />
          <div className="flex-1 flex min-w-0">
            <CollapsibleSidebar />
            <ProtectedRouteGate>{children}</ProtectedRouteGate>
          </div>
          <Footer />
        </ResumeProvider>
      </body>
    </html>
  );
}

