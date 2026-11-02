import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace Settings & Preferences',
  description:
    'Configure default resume templates, AI assistant preferences, and local JSON backup settings in your private VitaeFlow account.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
