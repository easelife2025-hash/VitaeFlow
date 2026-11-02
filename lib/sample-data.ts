import { ResumeDraft } from './types';

export const SAMPLE_RESUMES: ResumeDraft[] = [
  {
    id: 'draft-senior-product-designer',
    title: 'Senior Frontend Engineer — Design Systems',
    targetRole: 'Senior Frontend & Design Systems Engineer',
    updatedAt: new Date().toISOString(),
    templateId: 'modern-violet',
    accentColor: '#6D5CE8',
    compactMode: false,
    personalInfo: {
      fullName: 'Elena Rostova',
      jobTitle: 'Senior Frontend & Design Systems Engineer',
      email: 'elena.rostova@vitaeflow.io',
      phone: '+1 (415) 890-4321',
      location: 'San Francisco, CA',
      website: 'elenarostova.dev',
      linkedin: 'linkedin.com/in/elenarostova',
      summary:
        'Product-minded Senior Frontend Engineer with 7+ years of experience architecting accessible React and TypeScript web applications. Proven track record of scaling multi-brand design systems used by 45+ engineering squads and cutting checkout latency by 38% across mobile web viewports.',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Lumina Cloud Platform',
        role: 'Senior Frontend Engineer',
        location: 'San Francisco, CA',
        startDate: 'Mar 2023',
        endDate: 'Present',
        current: true,
        bullets: [
          'Spearheaded the migration of core analytics dashboards to Next.js App Router and TypeScript, reducing First Input Delay by 42% for 120K daily active enterprise users.',
          'Architected a unified component library of 64 WCAG AA accessible UI primitives in Tailwind CSS, accelerating feature delivery velocity across 12 product squads by 30%.',
          'Partnered with product and data science teams to ship real-time anomaly detection workflows, driving a 19% lift in enterprise annual contract expansions.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Veloce FinTech',
        role: 'Frontend Software Engineer',
        location: 'New York, NY',
        startDate: 'Jun 2020',
        endDate: 'Feb 2023',
        current: false,
        bullets: [
          'Built a mobile-first onboarding and KYC verification flow that increased mobile completion conversion from 61% to 84% within two quarters.',
          'Implemented automated visual regression and end-to-end Playwright test suites, decreasing production UI defects by 55% across bi-weekly releases.',
          'Mentored 5 junior and mid-level engineers through weekly architecture reviews, pair programming, and frontend performance clinics.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'B.S.',
        field: 'Computer Science & Human-Computer Interaction',
        location: 'Berkeley, CA',
        startDate: 'Aug 2016',
        endDate: 'May 2020',
        gpa: '3.85 / 4.0',
      },
    ],
    skills: [
      'TypeScript',
      'React 19',
      'Next.js',
      'Tailwind CSS',
      'Design Systems',
      'WCAG Accessibility',
      'GraphQL',
      'Playwright',
      'Performance Optimization',
      'Figma',
      'Node.js',
      'CI/CD Pipelines',
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Aether UI Primitives',
        subtitle: 'Open-Source Accessible React Hook & Component Toolkit',
        link: 'github.com/erostova/aether-ui',
        bullets: [
          'Authored a zero-dependency keyboard navigation and focus-trap library adopted by 4,200+ weekly npm downloads with 98% unit test coverage.',
          'Published interactive documentation with live token customization and automated contrast ratio verification.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'IAAP Certified Professional in Web Accessibility (CPWA)',
        issuer: 'International Association of Accessibility Professionals',
        date: '2024',
        credentialId: 'CPWA-88412',
      },
      {
        id: 'cert-2',
        name: 'Google Cloud Certified — Professional Cloud Developer',
        issuer: 'Google Cloud',
        date: '2023',
        credentialId: 'GCP-PCD-3091',
      },
    ],
    languages: [
      {
        id: 'lang-1',
        language: 'English',
        proficiency: 'Native / Bilingual',
      },
      {
        id: 'lang-2',
        language: 'Spanish',
        proficiency: 'Full Professional',
      },
      {
        id: 'lang-3',
        language: 'French',
        proficiency: 'Conversational',
      },
    ],
    jobDescriptionDraft:
      'We are seeking a Senior Frontend Engineer to lead our web platform architecture. Ideal candidates have 5+ years of experience with React, TypeScript, Next.js, and Tailwind CSS. You will own our design system, optimize Core Web Vitals, build AI-assisted workflows, collaborate with cross-functional product managers, and implement automated testing with Playwright or Cypress. Experience with GraphQL, State Management, and WebSockets is a strong plus.',
    atsAnalysis: {
      jobTitle: 'Senior Frontend Engineer',
      score: 96,
      roleAlignmentScore: 97,
      impactMetricsScore: 95,
      keywordCoverageScore: 94,
      summaryFeedback:
        'Strong alignment with core frontend architecture, Next.js, TypeScript, and design systems leadership. Adding explicit mention of Core Web Vitals and State Management will keep your ATS match at the top of the applicant pool.',
      matchedKeywords: [
        'React',
        'TypeScript',
        'Next.js',
        'Tailwind CSS',
        'Design Systems',
        'Playwright',
        'GraphQL',
        'WCAG Accessibility',
      ],
      missingKeywords: [
        'Core Web Vitals',
        'State Management',
        'WebSockets',
      ],
      bulletSuggestions: [
        {
          original:
            'Spearheaded the migration of core analytics dashboards to Next.js App Router and TypeScript, reducing First Input Delay by 42% for 120K daily active enterprise users.',
          improved:
            'Spearheaded the migration of core analytics dashboards to Next.js App Router and TypeScript, optimizing Core Web Vitals and reducing First Input Delay by 42% for 120K daily active users.',
          reason: 'Incorporates exact "Core Web Vitals" ATS keyword while preserving strong metrics.',
        },
      ],
      analyzedAt: new Date().toISOString(),
    },
  },
  {
    id: 'draft-product-manager',
    title: 'Product Manager — Growth & AI',
    targetRole: 'Senior Product Manager',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    templateId: 'teal-split',
    accentColor: '#18B89A',
    compactMode: false,
    personalInfo: {
      fullName: 'Marcus Vance',
      jobTitle: 'Senior Product Manager — B2B SaaS & AI',
      email: 'marcus.vance@vitaeflow.io',
      phone: '+1 (206) 555-0198',
      location: 'Seattle, WA',
      website: 'marcusvance.pm',
      linkedin: 'linkedin.com/in/marcusvance',
      summary:
        'Data-driven Senior Product Manager with 6+ years of experience scaling B2B SaaS workflows and generative AI copilot products from 0 to $18M ARR. Skilled in product-led growth (PLG), customer discovery, SQL funnel diagnostics, and cross-functional execution.',
    },
    experience: [
      {
        id: 'exp-pm-1',
        company: 'ScaleGrid Workspace',
        role: 'Senior Product Manager',
        location: 'Seattle, WA',
        startDate: 'Jan 2022',
        endDate: 'Present',
        current: true,
        bullets: [
          'Led end-to-end launch of an AI document summarization workflow, reaching 68% weekly adoption across 3,400 enterprise workspaces within 90 days.',
          'Redesigned self-serve trial activation funnel using A/B experimentation, lifting trial-to-paid conversion by 27% and adding $4.2M in net-new ARR.',
          'Aligned a 16-person engineering, design, and data science pod around quarterly OKRs, achieving a 94% on-time release cadence.',
        ],
      },
      {
        id: 'exp-pm-2',
        company: 'Horizon Analytics',
        role: 'Product Manager',
        location: 'Seattle, WA',
        startDate: 'Jul 2019',
        endDate: 'Dec 2021',
        current: false,
        bullets: [
          'Owned self-serve onboarding and billing experiences, reducing 30-day logo churn from 4.8% to 2.9% across SMB customers.',
          'Conducted 80+ structured customer discovery interviews to prioritize the enterprise permissions roadmap.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-pm-1',
        institution: 'University of Washington',
        degree: 'B.A.',
        field: 'Business Administration & Information Systems',
        location: 'Seattle, WA',
        startDate: 'Sep 2015',
        endDate: 'Jun 2019',
        gpa: '3.9 / 4.0',
      },
    ],
    skills: [
      'Product Strategy',
      'Product-Led Growth (PLG)',
      'A/B Experimentation',
      'SQL & Amplitude',
      'Generative AI Workflows',
      'Roadmap Prioritization',
      'Enterprise SaaS',
      'User Research',
    ],
    projects: [
      {
        id: 'proj-pm-1',
        name: 'PLG Benchmark Teardown',
        subtitle: 'Quarterly SaaS Onboarding Research Series',
        link: 'marcusvance.pm/plg',
        bullets: [
          'Analyzed 40+ B2B SaaS activation flows and published actionable conversion benchmarks read by 15,000+ product leaders.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-pm-1',
        name: ' Pragmatic Institute Certified Product Manager (PMC-III)',
        issuer: 'Pragmatic Institute',
        date: '2023',
        credentialId: 'PMC-44910',
      },
    ],
    languages: [
      {
        id: 'lang-pm-1',
        language: 'English',
        proficiency: 'Native / Bilingual',
      },
      {
        id: 'lang-pm-2',
        language: 'German',
        proficiency: 'Professional Working',
      },
    ],
    atsAnalysis: {
      jobTitle: 'Senior Product Manager — AI Platform',
      score: 94,
      roleAlignmentScore: 95,
      impactMetricsScore: 96,
      keywordCoverageScore: 91,
      summaryFeedback:
        'Exceptional ARR and conversion metrics paired with clear AI product launch ownership.',
      matchedKeywords: [
        'Product Strategy',
        'Product-Led Growth (PLG)',
        'A/B Experimentation',
        'SQL & Amplitude',
        'Generative AI Workflows',
        'Enterprise SaaS',
      ],
      missingKeywords: ['Mixpanel', 'Pricing Packaging'],
      bulletSuggestions: [],
      analyzedAt: new Date().toISOString(),
    },
  },
  {
    id: 'draft-executive-fullstack',
    title: 'Lead Full-Stack Engineer — Cloud & APIs',
    targetRole: 'Lead Full-Stack Software Engineer',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    templateId: 'executive-minimal',
    accentColor: '#18181B',
    compactMode: false,
    personalInfo: {
      fullName: 'David Chen',
      jobTitle: 'Lead Full-Stack & Distributed Systems Engineer',
      email: 'david.chen@vitaeflow.io',
      phone: '+1 (646) 712-9034',
      location: 'New York, NY',
      website: 'davidchen.io',
      linkedin: 'linkedin.com/in/davidchen-dev',
      summary:
        'Full-Stack Staff Software Engineer with 8+ years of experience building high-throughput TypeScript, Node.js, and PostgreSQL cloud platforms. Specialized in distributed API architecture, real-time financial ledgers, and zero-downtime database migrations.',
    },
    experience: [
      {
        id: 'exp-fs-1',
        company: 'Meridian Payments',
        role: 'Lead Full-Stack Software Engineer',
        location: 'New York, NY',
        startDate: 'Apr 2021',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected an idempotent settlement API in Node.js, TypeScript, and PostgreSQL processing $1.4B in annual transaction volume with 99.99% uptime.',
          'Optimized complex multi-tenant SQL queries and Redis caching layers, cutting p95 API latency from 310ms to 68ms.',
          'Built real-time reconciliation dashboards in Next.js and React, saving finance operations 22 hours of manual audit work per week.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-fs-1',
        institution: 'Cornell University',
        degree: 'B.S.',
        field: 'Computer Science',
        location: 'Ithaca, NY',
        startDate: 'Aug 2014',
        endDate: 'May 2018',
        gpa: '3.88 / 4.0',
      },
    ],
    skills: [
      'TypeScript',
      'Node.js',
      'React & Next.js',
      'PostgreSQL',
      'Redis',
      'GraphQL & REST APIs',
      'AWS & Docker',
      'System Architecture',
      'CI/CD & Automated Testing',
    ],
    projects: [
      {
        id: 'proj-fs-1',
        name: 'PgTrace',
        subtitle: 'Open-Source PostgreSQL Query Plan Visualizer',
        link: 'github.com/dchen/pgtrace',
        bullets: [
          'Created an interactive SQL execution plan inspector used by 2,800+ backend engineers to diagnose index bottlenecks.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-fs-1',
        name: 'AWS Certified Solutions Architect — Professional',
        issuer: 'Amazon Web Services',
        date: '2024',
        credentialId: 'AWS-SAP-91204',
      },
    ],
    languages: [
      {
        id: 'lang-fs-1',
        language: 'English',
        proficiency: 'Native / Bilingual',
      },
      {
        id: 'lang-fs-2',
        language: 'Mandarin Chinese',
        proficiency: 'Native / Bilingual',
      },
    ],
    atsAnalysis: {
      jobTitle: 'Lead Full-Stack Engineer',
      score: 93,
      roleAlignmentScore: 95,
      impactMetricsScore: 94,
      keywordCoverageScore: 90,
      summaryFeedback:
        'Strong backend and full-stack metrics with clear reliability and latency improvements.',
      matchedKeywords: [
        'TypeScript',
        'Node.js',
        'React',
        'Next.js',
        'PostgreSQL',
        'REST APIs',
        'AWS',
      ],
      missingKeywords: ['Kubernetes', 'Terraform'],
      bulletSuggestions: [],
      analyzedAt: new Date().toISOString(),
    },
  },
];

export const SAMPLE_JOB_DESCRIPTIONS: {
  id: string;
  label: string;
  roleTitle: string;
  text: string;
}[] = [
  {
    id: 'jd-frontend',
    label: 'Senior Frontend Engineer',
    roleTitle: 'Senior Frontend Engineer',
    text: `We are looking for a Senior Frontend Engineer to lead our customer-facing web application team.
Responsibilities:
- Architect scalable, accessible, mobile-first user interfaces using React, TypeScript, Next.js, and Tailwind CSS.
- Own and evolve our multi-product Design System and reusable component library with strict WCAG AA accessibility compliance.
- Optimize Core Web Vitals, bundle size, and client-side state management for low-latency performance.
- Partner with product managers and designers to ship AI-powered user workflows and interactive data visualizations.
- Maintain high code quality through automated end-to-end testing with Playwright, unit testing, and CI/CD pipelines.
Qualifications:
- 5+ years of production experience in Frontend Engineering with TypeScript, React, Next.js, GraphQL, and REST APIs.
- Strong understanding of responsive design, WebSockets, and modern browser rendering performance.`,
  },
  {
    id: 'jd-pm',
    label: 'Senior Product Manager (AI)',
    roleTitle: 'Senior Product Manager — AI Platform',
    text: `We are hiring a Senior Product Manager to drive our AI productivity suite and Product-Led Growth (PLG) roadmap.
Responsibilities:
- Define the multi-quarter product vision, strategy, and roadmap for generative AI copilot features.
- Run rapid A/B experimentation and funnel analysis using SQL, Amplitude, and Mixpanel to improve user activation and retention.
- Conduct deep customer discovery interviews with enterprise stakeholders and translate insights into clear PRDs.
- Collaborate daily with engineering, design, and go-to-market teams to ship high-impact SaaS releases on schedule.
Qualifications:
- 5+ years in SaaS Product Management with proven ARR growth outcomes, LLM/AI feature delivery, and agile execution.`,
  },
  {
    id: 'jd-fullstack',
    label: 'Full-Stack TypeScript Engineer',
    roleTitle: 'Full-Stack Software Engineer',
    text: `Seeking a Full-Stack Software Engineer to build high-reliability cloud applications.
Requirements:
- Strong proficiency in TypeScript, React, Next.js, Node.js, and PostgreSQL.
- Experience designing RESTful APIs, GraphQL schemas, authentication flows, and cloud deployments on AWS or GCP.
- Track record of improving API response latency, database query indexing, and automated test coverage with Jest and Playwright.`,
  },
];

export function createBlankResume(title = 'Untitled Resume'): ResumeDraft {
  return {
    id: `draft-${Date.now()}`,
    title,
    targetRole: 'Software Engineer',
    updatedAt: new Date().toISOString(),
    templateId: 'modern-violet',
    accentColor: '#6D5CE8',
    compactMode: false,
    personalInfo: {
      fullName: 'Alex Morgan',
      jobTitle: 'Full-Stack Software Engineer',
      email: 'alex.morgan@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Austin, TX',
      website: 'alexmorgan.dev',
      linkedin: 'linkedin.com/in/alexmorgan',
      summary:
        'Results-focused Software Engineer with 4+ years of experience delivering high-impact web applications, collaborating across multidisciplinary product teams, and driving measurable performance improvements.',
    },
    experience: [
      {
        id: `exp-${Date.now()}`,
        company: 'Acme Cloud Technologies',
        role: 'Software Engineer',
        location: 'Austin, TX',
        startDate: 'Jan 2022',
        endDate: 'Present',
        current: true,
        bullets: [
          'Developed and maintained responsive web features using TypeScript, React, and Next.js, improving customer satisfaction scores by 24%.',
          'Collaborated with cross-functional teams to streamline REST API integrations and reduce average page load times by 35%.',
        ],
      },
    ],
    education: [
      {
        id: `edu-${Date.now()}`,
        institution: 'University of Texas at Austin',
        degree: 'B.S.',
        field: 'Computer Science',
        location: 'Austin, TX',
        startDate: 'Aug 2018',
        endDate: 'May 2022',
        gpa: '3.8 / 4.0',
      },
    ],
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'Node.js',
      'PostgreSQL',
      'REST APIs',
      'Git & CI/CD',
    ],
    projects: [
      {
        id: `proj-${Date.now()}`,
        name: 'PulseMetrics Dashboard',
        subtitle: 'Real-Time Web Vitals & API Telemetry Monitor',
        link: 'github.com/alexmorgan/pulsemetrics',
        bullets: [
          'Built a lightweight telemetry dashboard tracking p95 latency and Core Web Vitals across 15+ microservices.',
        ],
      },
    ],
    certifications: [
      {
        id: `cert-${Date.now()}`,
        name: 'AWS Certified Developer — Associate',
        issuer: 'Amazon Web Services',
        date: '2024',
        credentialId: 'AWS-DVA-2049',
      },
    ],
    languages: [
      {
        id: `lang-${Date.now()}`,
        language: 'English',
        proficiency: 'Native / Bilingual',
      },
      {
        id: `lang-${Date.now() + 1}`,
        language: 'Spanish',
        proficiency: 'Professional Working',
      },
    ],
  };
}
