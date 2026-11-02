'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target,
  Plus,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  FolderOpen,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { AtsAnalysisResult, EditorSectionId } from '@/lib/types';
import {
  evaluateResumeDeterministically,
  SECTION_LABELS,
} from '@/lib/ats-deterministic';
import { SAMPLE_JOB_DESCRIPTIONS } from '@/lib/sample-data';
import ResumePreview from '@/components/ResumePreview';

export default function JobMatcherPage() {
  const router = useRouter();
  const {
    activeResume,
    drafts,
    handleUpdateActiveResume,
    setTargetEditorSection,
    customAiLimit,
    setAiUsage,
    openDraftsModal,
    handleUpdateTemplate,
    handleUpdateAccent,
    handleExportPdf,
  } = useResume();

  const [jobDescription, setJobDescription] = useState<string>(
    activeResume.jobDescriptionDraft || SAMPLE_JOB_DESCRIPTIONS[0].text
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeResume.jobDescriptionDraft) {
      setJobDescription(activeResume.jobDescriptionDraft);
    }
  }, [activeResume.jobDescriptionDraft]);

  const deterministic = useMemo(
    () => evaluateResumeDeterministically(activeResume, jobDescription),
    [activeResume, jobDescription]
  );

  const analysis = activeResume.atsAnalysis;

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

  const handleJumpToSection = (sectionId: EditorSectionId) => {
    setTargetEditorSection(sectionId);
    router.push(`/resume-builder?section=${sectionId}`);
  };

  const handleRunMatcher = async () => {
    if (!jobDescription.trim()) {
      setError('Paste a target job description first to compare requirements.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/ats-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-custom-limit': String(customAiLimit),
        },
        body: JSON.stringify({
          resume: activeResume,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (data.usage) {
        setAiUsage(data.usage);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to run Job Matcher analysis.');
      }

      const nextAnalysis: AtsAnalysisResult = data.analysis;
      handleUpdateActiveResume({
        ...activeResume,
        updatedAt: new Date().toISOString(),
        jobDescriptionDraft: jobDescription,
        atsAnalysis: nextAnalysis,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not complete contextual Gemini job alignment advice.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddGenuineMissingKeyword = (keyword: string) => {
    const alreadyExists = activeResume.skills.some(
      (s) => s.toLowerCase() === keyword.toLowerCase()
    );
    const updatedSkills = alreadyExists
      ? activeResume.skills
      : [...activeResume.skills, keyword];

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

      handleUpdateActiveResume({
        ...activeResume,
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
      handleUpdateActiveResume({
        ...activeResume,
        updatedAt: new Date().toISOString(),
        skills: updatedSkills,
      });
    }
  };

  const handleApplySuggestedBullet = (original: string, improved: string) => {
    let matchedInExperience = false;
    const updatedExperience = activeResume.experience.map((exp) => {
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

    handleUpdateActiveResume({
      ...activeResume,
      updatedAt: new Date().toISOString(),
      experience: updatedExperience,
    });
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Page Header Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[#6D5CE8] flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>Target Job Description Keyword & Context Matcher</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Active Resume: {activeResume.title}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#18181B]">
              Job Description Matcher & Contextual AI Advisor
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Paste a target job posting below to compare matched vs. missing keywords and get fact-safe Gemini tailoring suggestions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openDraftsModal}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#6D5CE8]" />
              <span>Switch Resume ({drafts.length})</span>
            </button>

            <Link
              href="/ats-checker"
              className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-[#18B89A] text-xs font-semibold text-slate-700 hover:text-[#18B89A] transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#18B89A]" />
              <span>View 8-Section ATS Audit</span>
            </Link>
          </div>
        </div>

        {/* Main Split Layout: Job Matcher Controls (Left) & Live A4 Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Paste Job Description & Run Comparison */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-[#18181B] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#6D5CE8]" />
                    <span>Target Job Description</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deterministic keyword matching updates live as you type; click Run Contextual AI Advice for deep Gemini analysis.
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
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description, responsibilities, and qualifications here..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-[#18181B] leading-relaxed focus:border-[#6D5CE8] focus:outline-none focus:ring-2 focus:ring-[#6D5CE8]/15"
              />

              {/* Match Summary Strip */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500">
                    JD Keyword Coverage
                  </span>
                  <span className="font-mono tabular-nums text-base font-bold text-[#18B89A]">
                    {displayedKeywordCoverage}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500">
                    Matched Terms
                  </span>
                  <span className="font-mono tabular-nums text-base font-bold text-[#18181B]">
                    {displayedMatchedKeywords.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500">
                    Missing Terms
                  </span>
                  <span className="font-mono tabular-nums text-base font-bold text-[#6D5CE8]">
                    {displayedMissingKeywords.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">
                  Never claims a guaranteed ATS pass or invents missing skills.
                </span>
                <button
                  type="button"
                  onClick={handleRunMatcher}
                  disabled={isAnalyzing}
                  className="min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#6D5CE8] hover:bg-[#5B4AD6] disabled:opacity-60 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
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

            {/* 2. Keyword Comparison: Matched Keywords vs. Missing Relevant Terms */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-[#18181B]">
                    Keyword Comparison (Resume vs. Job Description)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review matched terms and missing requirements. Only add missing skills if you genuinely possess them.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToSection('skills')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#6D5CE8] text-xs font-semibold text-[#6D5CE8] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Skills Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      Matched Keywords ({displayedMatchedKeywords.length})
                    </h3>
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
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      Missing Relevant Terms ({displayedMissingKeywords.length})
                    </h3>
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
                          Tap any skill you genuinely possess to add it to{' '}
                          <button
                            type="button"
                            onClick={() => handleJumpToSection('skills')}
                            className="font-semibold text-[#6D5CE8] hover:underline cursor-pointer"
                          >
                            Skills
                          </button>{' '}
                          or mention it in{' '}
                          <button
                            type="button"
                            onClick={() => handleJumpToSection('experience')}
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

            {/* 3. Gemini Contextual Advice & Actionable Suggestions */}
            {isAnalyzing && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-5 w-56 bg-slate-200 rounded" />
                <div className="h-20 w-full bg-slate-100 rounded-xl" />
                <div className="h-20 w-full bg-slate-100 rounded-xl" />
              </div>
            )}

            {!isAnalyzing && analysis && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                {analysis.summaryFeedback && (
                  <div className="p-4 rounded-xl bg-[#6D5CE8]/[0.04] border border-[#6D5CE8]/20 space-y-1">
                    <span className="text-xs font-bold text-[#6D5CE8]">
                      Target Role Summary Assessment ({analysis.jobTitle})
                    </span>
                    <p className="text-xs sm:text-sm text-[#18181B] leading-relaxed">
                      {analysis.summaryFeedback}
                    </p>
                  </div>
                )}

                {analysis.actionableSuggestions &&
                  analysis.actionableSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-display text-sm sm:text-base font-bold text-[#18181B] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#6D5CE8]" />
                          <span>Gemini Contextual Actionable Suggestions</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tailored recommendations comparing your resume to the target job description. Click any button to jump to that section.
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
                                onClick={() => handleJumpToSection(secId)}
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
                                  onClick={() => handleJumpToSection(targetSec)}
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

          {/* Right Column: Live Synchronized A4 Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-20">
            <ResumePreview
              resume={activeResume}
              onUpdateTemplate={handleUpdateTemplate}
              onUpdateAccent={handleUpdateAccent}
              onExportPdf={() => handleExportPdf()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
