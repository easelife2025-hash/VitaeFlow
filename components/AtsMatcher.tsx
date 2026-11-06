'use client';

import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Check,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResumeDraft,
  AtsAnalysisResult,
  EditorSectionId,
  AiUsageMetadata,
} from '@/lib/types';
import {
  evaluateResumeDeterministically,
  SECTION_LABELS,
} from '@/lib/ats-deterministic';
import { SAMPLE_JOB_DESCRIPTIONS } from '@/lib/sample-data';
import { authenticatedFetch } from '@/lib/firebase';

interface AtsMatcherProps {
  resume: ResumeDraft;
  onChangeResume: (updated: ResumeDraft) => void;
  onNavigateToSection: (sectionId: EditorSectionId) => void;
  customAiLimit?: number;
  onUsageUpdate?: (usage: AiUsageMetadata) => void;
}

export default function AtsMatcher({
  resume,
  onChangeResume,
  onNavigateToSection,
  customAiLimit = 30,
  onUsageUpdate,
}: AtsMatcherProps) {
  const [jobDescription, setJobDescription] = useState<string>(
    resume.jobDescriptionDraft || SAMPLE_JOB_DESCRIPTIONS[0].text
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevDraft, setPrevDraft] = useState(resume.jobDescriptionDraft);
  if (resume.jobDescriptionDraft && resume.jobDescriptionDraft !== prevDraft) {
    setPrevDraft(resume.jobDescriptionDraft);
    setJobDescription(resume.jobDescriptionDraft);
  }

  // Instant deterministic evaluation on every resume or JD change
  const deterministic = useMemo(
    () => evaluateResumeDeterministically(resume, jobDescription),
    [resume, jobDescription]
  );

  const analysis = resume.atsAnalysis;

  // Use AI-blended score when available, otherwise live deterministic estimated score
  const displayedEstimatedScore =
    analysis?.score ?? deterministic.estimatedQualityScore;

  const displayedMatchedKeywords =
    analysis && analysis.matchedKeywords.length > 0
      ? analysis.matchedKeywords
      : deterministic.matchedKeywords;

  const displayedMissingKeywords =
    analysis && analysis.missingKeywords.length > 0
      ? analysis.missingKeywords
      : deterministic.missingKeywords;

  const displayedKeywordCoverage =
    analysis?.keywordCoverageScore ?? deterministic.keywordCoverageScore;

  const handleRunMatcher = async () => {
    if (!jobDescription.trim()) {
      setError('Paste a target job description first to compare requirements.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await authenticatedFetch('/api/ai/ats-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-custom-limit': String(customAiLimit),
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (data.usage && onUsageUpdate) {
        onUsageUpdate(data.usage);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to run ATS analysis.');
      }

      const nextAnalysis: AtsAnalysisResult = data.analysis;
      onChangeResume({
        ...resume,
        updatedAt: new Date().toISOString(),
        jobDescriptionDraft: jobDescription,
        atsAnalysis: nextAnalysis,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not complete contextual Gemini ATS advice.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddGenuineMissingKeyword = (keyword: string) => {
    const alreadyExists = resume.skills.some(
      (s) => s.toLowerCase() === keyword.toLowerCase()
    );
    const updatedSkills = alreadyExists
      ? resume.skills
      : [...resume.skills, keyword];

    if (analysis) {
      const nextMissing = analysis.missingKeywords.filter((k) => k !== keyword);
      const nextMatched = Array.from(
        new Set([...analysis.matchedKeywords, keyword])
      );
      const totalKeywords = nextMissing.length + nextMatched.length;
      const newCoverage =
        totalKeywords > 0
          ? Math.round((nextMatched.length / totalKeywords) * 100)
          : analysis.keywordCoverageScore;
      const boostedOverall = Math.min(98, analysis.score + 2);

      onChangeResume({
        ...resume,
        updatedAt: new Date().toISOString(),
        skills: updatedSkills,
        atsAnalysis: {
          ...analysis,
          score: boostedOverall,
          keywordCoverageScore: newCoverage,
          matchedKeywords: nextMatched,
          missingKeywords: nextMissing,
        },
      });
    } else {
      onChangeResume({
        ...resume,
        updatedAt: new Date().toISOString(),
        skills: updatedSkills,
      });
    }
  };

  const handleApplySuggestedBullet = (original: string, improved: string) => {
    let matchedInExperience = false;
    const updatedExperience = resume.experience.map((exp) => {
      const idx = exp.bullets.findIndex(
        (b) => b.trim().toLowerCase() === original.trim().toLowerCase()
      );
      if (idx !== -1) {
        matchedInExperience = true;
        const nextBullets = [...exp.bullets];
        nextBullets[idx] = improved;
        return { ...exp, bullets: nextBullets };
      }
      return exp;
    });

    if (!matchedInExperience && updatedExperience.length > 0) {
      updatedExperience[0] = {
        ...updatedExperience[0],
        bullets: [improved, ...updatedExperience[0].bullets],
      };
    }

    onChangeResume({
      ...resume,
      updatedAt: new Date().toISOString(),
      experience: updatedExperience,
    });
  };

  // SVG Ring calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(98, Math.max(0, displayedEstimatedScore)) / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* 1. ESTIMATED RESUME QUALITY SCORE & TRANSPARENCY HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Honesty & Anti-Guarantee Banner */}
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#18B89A] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#18181B]">
              Transparent Estimated Quality & Alignment Score:
            </strong>{' '}
            Combines deterministic code checks (section completeness, formatting, and exact keyword overlap) with Gemini contextual advice. No tool can guarantee an automated ATS pass—only add skills and experience that are genuinely yours.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Estimated Score Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={displayedEstimatedScore >= 80 ? '#18B89A' : '#6D5CE8'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono tabular-nums text-xl font-bold text-[#18181B]">
                {displayedEstimatedScore}%
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                Est. Quality
              </span>
            </div>
          </div>

          {/* Score Breakdown & Measurable Metrics */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#18181B]">
                  {analysis?.jobTitle
                    ? `Target Comparison: ${analysis.jobTitle}`
                    : 'Estimated Resume Quality & ATS Readiness'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {analysis?.summaryFeedback ||
                    'Live deterministic audit of your 8 resume sections, bullet formatting, and target job description keywords.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">
                  Completeness
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-[#18181B]">
                  {deterministic.completenessScore}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">
                  Formatting Check
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-[#6D5CE8]">
                  {deterministic.formattingScore}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">
                  JD Keyword Overlap
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-[#18B89A]">
                  {displayedKeywordCoverage}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">
                  Quantified Bullets
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-[#18181B]">
                  {deterministic.quantifiedBullets}/{deterministic.totalBullets}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PASTE JOB DESCRIPTION & RUN COMPARISON */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-[#18181B] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6D5CE8]" />
              <span>Compare Against a Job Description</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste a job posting below. Deterministic keyword matching updates live; click Analyze for Gemini contextual advice.
            </p>
          </div>

          {/* Preset Job Descriptions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SAMPLE_JOB_DESCRIPTIONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setJobDescription(preset.text)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-[#6D5CE8] bg-slate-100 hover:bg-[#6D5CE8]/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description, responsibilities, and qualifications here..."
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Deterministic check found{' '}
            <strong className="font-mono tabular-nums text-[#18181B]">
              { displayedMatchedKeywords.length }
            </strong>{' '}
            matched terms and{' '}
            <strong className="font-mono tabular-nums text-[#18181B]">
              { displayedMissingKeywords.length }
            </strong>{' '}
            missing terms.
          </span>
          <button
            type="button"
            onClick={handleRunMatcher}
            disabled={isAnalyzing}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <RefreshCw
              className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`}
            />
            <span>
              {isAnalyzing
                ? 'Running Gemini Contextual Analysis...'
                : 'Run Contextual AI Advice'}
            </span>
          </button>
        </div>

        {error && (
          <div className="flex items-start justify-between gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRunMatcher}
              className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. KEYWORD ANALYSIS: MATCHED KEYWORDS VS MISSING RELEVANT TERMS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B]">
              Keyword Comparison (Resume vs. Job Description)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review matched terms and missing requirements. Only add missing skills if you genuinely possess them.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToSection('skills')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Skills Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
                Matched Keywords ({displayedMatchedKeywords.length})
              </h4>
              <span className="text-[11px] text-[#18B89A] font-medium">
                Verified in your resume
              </span>
            </div>

            {displayedMatchedKeywords.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Paste a job description above to detect matching keywords.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {displayedMatchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18B89A]/10 text-[#18181B] text-xs font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-[#18B89A]" />
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Relevant Terms */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
                Missing Relevant Terms ({displayedMissingKeywords.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Click to add ONLY if truthful
              </span>
            </div>

            {displayedMissingKeywords.length === 0 ? (
              <p className="text-xs text-[#18B89A] font-medium py-2">
                All detected terms from this job description are already covered in your resume!
              </p>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {displayedMissingKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      title={`Add "${kw}" to your Skills section if you have experience with it`}
                      onClick={() => handleAddGenuineMissingKeyword(kw)}
                      className="min-h-[34px] px-2.5 py-1 rounded-xl border border-[#6D5CE8]/30 bg-[#6D5CE8]/5 hover:bg-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{kw}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#6D5CE8] shrink-0" />
                  <span>
                    Have experience with one of these? Tap to add it to{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToSection('skills')}
                      className="font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
                    >
                      Skills
                    </button>{' '}
                    or mention it in{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToSection('experience')}
                      className="font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
                    >
                      Work Experience
                    </button>
                    .
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DETERMINISTIC FORMATTING & READABILITY WARNINGS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                Formatting & Content Warnings ({deterministic.formattingWarnings.length})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic code checks for passive phrasing, bullet length, date formatting, and header completeness.
            </p>
          </div>
        </div>

        {deterministic.formattingWarnings.length === 0 ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#18B89A]/10 text-xs font-medium text-[#18181B]">
            <CheckCircle2 className="w-4 h-4 text-[#18B89A] shrink-0" />
            <span>
              Zero formatting warnings! Your contact header, dates, summary length, and action verbs pass all deterministic checks.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {deterministic.formattingWarnings.map((warn) => (
              <div
                key={warn.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        warn.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {warn.severity}
                    </span>
                    <span className="text-xs font-bold text-[#18181B]">
                      {warn.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {warn.detail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToSection(warn.targetSection)}
                  className="min-h-[34px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Fix in {SECTION_LABELS[warn.targetSection]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. DETERMINISTIC SECTION COMPLETENESS CHECKS (ALL 8 SECTIONS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#18B89A]" />
              <span>Section Completeness Checklist (8 Sections)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every check links directly to its editable resume section.
            </p>
          </div>
          <span className="font-mono tabular-nums text-xs font-bold text-[#18181B]">
            {deterministic.completenessScore}/100 pts
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {deterministic.sectionChecks.map((check) => (
            <div
              key={check.sectionId}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      check.status === 'complete'
                        ? 'bg-[#18B89A]'
                        : check.status === 'partial'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold text-[#18181B]">
                    {check.label}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400">
                    ({check.earnedPoints}/{check.maxPoints} pts)
                  </span>
                </div>
                <p className="text-xs text-slate-600">{check.summary}</p>
                {check.recommendation && (
                  <p className="text-[11px] text-[#6D5CE8] font-medium">
                    Tip: {check.recommendation}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigateToSection(check.sectionId)}
                className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Edit {check.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. GEMINI CONTEXTUAL ADVICE & ACTIONABLE SUGGESTIONS (LINKED TO SECTIONS) */}
      {isAnalyzing && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
        </div>
      )}

      {!isAnalyzing && analysis && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Actionable Contextual Suggestions */}
          {analysis.actionableSuggestions &&
            analysis.actionableSuggestions.length > 0 && (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6D5CE8]" />
                    <span>Gemini Contextual Actionable Suggestions</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailored recommendations comparing your resume to the target job description. Click any link to jump to that section.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {analysis.actionableSuggestions.map((sug, idx) => {
                    const secId = sug.targetSection || 'experience';
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                sug.priority === 'high'
                                  ? 'bg-[#6D5CE8]/15 text-[#6D5CE8]'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {sug.priority} impact
                            </span>
                            <span className="text-xs font-bold text-[#18181B]">
                              {sug.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {sug.advice}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onNavigateToSection(secId)}
                          className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#6D5CE8] hover:bg-[#5B4AD6] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Edit {SECTION_LABELS[secId]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Fact-Preserving Tailored Bullet Improvements */}
          {analysis.bulletSuggestions &&
            analysis.bulletSuggestions.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
                    Contextual Bullet Phrasing Suggestions (Review Before Applying)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preserves your facts while aligning terminology with the target posting.
                  </p>
                </div>

                {analysis.bulletSuggestions.map((item, idx) => {
                  const targetSec = item.targetSection || 'experience';
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {item.reason}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigateToSection(targetSec)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#6D5CE8] text-xs font-semibold text-slate-700 hover:text-[#6D5CE8] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open {SECTION_LABELS[targetSec]}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleApplySuggestedBullet(
                                item.original,
                                item.improved
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#18B89A] hover:bg-[#149E83] text-white text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Apply to Resume</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-through">
                        {item.original}
                      </p>
                      <p className="text-sm font-medium text-[#18181B]">
                        {item.improved}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
