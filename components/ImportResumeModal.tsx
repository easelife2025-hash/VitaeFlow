'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ResumeDraft, LanguageProficiency } from '@/lib/types';
import { createBlankResume } from '@/lib/sample-data';
import { authenticatedFetch } from '@/lib/firebase';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedDraft: ResumeDraft) => void;
}

const SAMPLE_PASTE_RESUME = `Jordan Taylor
Senior Cloud & Backend Engineer
jordan.taylor@email.com | +1 (415) 782-1920 | Seattle, WA | github.com/jtaylor | linkedin.com/in/jordantaylor

SUMMARY
Cloud-native Backend Engineer with 6+ years of experience designing fault-tolerant microservices in TypeScript, Go, and PostgreSQL. Reduced cloud infrastructure spend by 28% while scaling event-driven pipelines to 40,000 requests/sec.

EXPERIENCE
Staff Backend Engineer — Nimbus Data Systems (Seattle, WA | Feb 2022 – Present)
- Architected an event-driven billing pipeline using Kafka, Node.js, and PostgreSQL, processing $650M in annual usage volume with zero data loss.
- Migrated 18 legacy services to Kubernetes and Terraform on AWS, cutting deployment rollback times from 45 minutes to under 90 seconds.

Software Engineer — Apex Core (Portland, OR | Jul 2019 – Jan 2022)
- Built GraphQL and REST APIs serving 85,000 daily active users with a p95 response latency under 45ms.

EDUCATION
B.S. in Computer Engineering — University of Washington (2015 – 2019) | GPA: 3.85

SKILLS
TypeScript, Node.js, Go, PostgreSQL, Redis, Kafka, AWS, Kubernetes, Docker, Terraform, GraphQL

PROJECTS
KubePulse — Open-Source Kubernetes Pod Cost Analyzer (github.com/jtaylor/kubepulse)
- Created a CLI diagnostic tool with 1,900+ GitHub stars that identifies idle container CPU/memory allocations.

CERTIFICATIONS
Certified Kubernetes Administrator (CKA) — Cloud Native Computing Foundation (2024) | ID: CKA-99210
AWS Certified Solutions Architect Associate — Amazon Web Services (2023)

LANGUAGES
English (Native / Bilingual), Japanese (Conversational)`;

export default function ImportResumeModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportResumeModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const normalizeDraft = (partial: Partial<ResumeDraft>): ResumeDraft => {
    const base = createBlankResume(
      partial.title ||
        (partial.personalInfo?.fullName
          ? `${partial.personalInfo.fullName} — Imported Resume`
          : 'Imported Resume')
    );

    const validProficiencies: LanguageProficiency[] = [
      'Native / Bilingual',
      'Full Professional',
      'Professional Working',
      'Conversational',
      'Elementary',
    ];

    return {
      ...base,
      title:
        partial.title ||
        `${partial.personalInfo?.fullName || 'Candidate'} — ${
          partial.personalInfo?.jobTitle || 'Imported Resume'
        }`,
      targetRole: partial.personalInfo?.jobTitle || base.targetRole,
      updatedAt: new Date().toISOString(),
      templateId: partial.templateId || 'modern-violet',
      accentColor: partial.accentColor || '#6D5CE8',
      compactMode: Boolean(partial.compactMode),
      personalInfo: {
        ...base.personalInfo,
        ...(partial.personalInfo || {}),
      },
      experience: Array.isArray(partial.experience)
        ? partial.experience.map((e, i) => ({
            id: e.id || `exp-imp-${Date.now()}-${i}`,
            company: e.company || '',
            role: e.role || '',
            location: e.location || '',
            startDate: e.startDate || '',
            endDate: e.endDate || 'Present',
            current: Boolean(e.current),
            bullets:
              Array.isArray(e.bullets) && e.bullets.length > 0
                ? e.bullets
                : [''],
          }))
        : base.experience,
      education: Array.isArray(partial.education)
        ? partial.education.map((edu, i) => ({
            id: edu.id || `edu-imp-${Date.now()}-${i}`,
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
          }))
        : base.education,
      skills:
        Array.isArray(partial.skills) && partial.skills.length > 0
          ? partial.skills
          : base.skills,
      projects: Array.isArray(partial.projects)
        ? partial.projects.map((p, i) => ({
            id: p.id || `proj-imp-${Date.now()}-${i}`,
            name: p.name || '',
            subtitle: p.subtitle || '',
            link: p.link || '',
            bullets:
              Array.isArray(p.bullets) && p.bullets.length > 0
                ? p.bullets
                : [''],
          }))
        : [],
      certifications: Array.isArray(partial.certifications)
        ? partial.certifications.map((c, i) => ({
            id: c.id || `cert-imp-${Date.now()}-${i}`,
            name: c.name || '',
            issuer: c.issuer || '',
            date: c.date || '',
            credentialId: c.credentialId || '',
          }))
        : [],
      languages: Array.isArray(partial.languages)
        ? partial.languages.map((l, i) => ({
            id: l.id || `lang-imp-${Date.now()}-${i}`,
            language: l.language || '',
            proficiency: validProficiencies.includes(
              l.proficiency as LanguageProficiency
            )
              ? (l.proficiency as LanguageProficiency)
              : 'Full Professional',
          }))
        : [],
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadedFileName(file.name);

    try {
      const content = await file.text();
      if (file.name.endsWith('.json')) {
        const parsedJson = JSON.parse(content);
        const importedDraft = normalizeDraft({
          ...parsedJson,
          id: `draft-${Date.now()}`,
        });
        onImportSuccess(importedDraft);
        onClose();
        return;
      }
      // For .txt / .md files, populate the textarea for AI structure parsing
      setRawText(content);
    } catch {
      setError(
        'Could not read the uploaded file. Please upload a valid .json, .txt, or .md file, or paste your resume text below.'
      );
    }
  };

  const handleParseText = async () => {
    if (!rawText.trim()) {
      setError('Paste your resume text or upload a file first.');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      // First check if user pasted valid VitaeFlow JSON
      if (rawText.trim().startsWith('{')) {
        try {
          const parsedJson = JSON.parse(rawText.trim());
          if (parsedJson.personalInfo) {
            const imported = normalizeDraft({
              ...parsedJson,
              id: `draft-${Date.now()}`,
            });
            onImportSuccess(imported);
            onClose();
            return;
          }
        } catch {
          // Proceed with AI text parser
        }
      }

      const res = await authenticatedFetch('/api/ai/import-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume text.');
      }

      const importedDraft = normalizeDraft(data.parsed);
      onImportSuccess(importedDraft);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to structure resume. Try pasting plain text or uploading a JSON backup.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-resume-modal-title"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2
              id="import-resume-modal-title"
              className="font-display text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#6D5CE8]" />
              <span>Import Existing Resume</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a VitaeFlow JSON backup, upload a text/markdown file, or paste your existing resume text to auto-extract all 8 sections.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-[#18181B] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-[#6D5CE8]/50 rounded-2xl p-5 bg-[#F8FAFC]/70 text-center space-y-2.5 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-[#6D5CE8]/10 text-[#6D5CE8] flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs sm:text-sm font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
              >
                Choose a .json, .txt, or .md file
              </button>
              <p className="text-xs text-slate-500 mt-0.5">
                JSON files restore immediately; text files are parsed into Personal, Experience, Education, Skills, Projects, Certifications & Languages.
              </p>
            </div>
            {uploadedFileName && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#18B89A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Loaded: {uploadedFileName}</span>
              </div>
            )}
          </div>

          {/* Or Paste Resume Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="import-raw-text"
                className="text-xs font-semibold text-slate-700"
              >
                Or Paste Raw Resume Text
              </label>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_PASTE_RESUME)}
                className="text-xs font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
              >
                Load Sample Resume Text to Test
              </button>
            </div>

            <textarea
              id="import-raw-text"
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full text of your existing resume (Name, Contact, Summary, Experience, Education, Skills, Certifications, Languages)..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-[#18181B] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleParseText}
            disabled={isParsing}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`}
            />
            <span>
              {isParsing
                ? 'Extracting 8 Sections with AI...'
                : 'Import & Open in Editor'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
