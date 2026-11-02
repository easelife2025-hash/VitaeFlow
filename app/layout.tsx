import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  DM_Sans,
  JetBrains_Mono,
  Inter,
  Lato,
  Roboto,
  Playfair_Display,
  Great_Vibes,
} from 'next/font/google';
import './globals.css';
import { ResumeProvider } from '@/context/ResumeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import {
  SITE_URL,
  SITE_NAME,
  SITE_FULL_NAME,
  CORE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  getWebsiteJsonLd,
  getWebApplicationJsonLd,
} from '@/lib/seo';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-playfair',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-calligraphy',
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = getWebsiteJsonLd();
  const webAppJsonLd = getWebApplicationJsonLd();

  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${inter.variable} ${lato.variable} ${roboto.variable} ${playfair.variable} ${greatVibes.variable}`}
    >
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
            <div className="flex-1 flex flex-col min-w-0">{children}</div>
          </div>
          <Footer />
        </ResumeProvider>
      </body>
    </html>
  );
}
