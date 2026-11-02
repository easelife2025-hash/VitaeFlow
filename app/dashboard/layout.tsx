import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Resume Workspace & Saved Drafts',
  description:
    'Manage your saved resume versions, duplicate drafts, and review ATS readiness scores in your private VitaeFlow workspace.',
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
