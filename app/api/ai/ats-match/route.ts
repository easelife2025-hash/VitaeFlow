import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { evaluateResumeDeterministically } from '@/lib/ats-deterministic';
import { buildFactSafeBulletVariations } from '@/lib/ai-fallback';
import { EditorSectionId, ResumeDraft } from '@/lib/types';

export const maxDuration = 60;

const VALID_SECTIONS: EditorSectionId[] = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

function sanitizeSectionId(
  raw: unknown,
  fallback: EditorSectionId = 'experience'
): EditorSectionId {
  const str = cleanValidatedString(raw).toLowerCase() as EditorSectionId;
  return VALID_SECTIONS.includes(str) ? str : fallback;
}

export async function POST(req: NextRequest) {
  const quota = checkAndConsumeAiQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.errorMessage, usage: quota.usage },
      { status: 429 }
    );
  }

  let resumeData: ResumeDraft | undefined;
  let jdText = '';

  try {
    const body = await req.json();
    const { resume, jobDescription } = body;
    resumeData = resume;
    jdText = typeof jobDescription === 'string' ? jobDescription.trim() : '';

    if (
      !jobDescription ||
      typeof jobDescription !== 'string' ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        {
          error: 'Please paste a target job description to run the ATS comparison.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    // 1. Run deterministic checks first
    const deterministic = evaluateResumeDeterministically(
      resume,
      jobDescription
    );

    const resumeSummaryText = JSON.stringify({
      jobTitle: resume?.personalInfo?.jobTitle,
      summary: resume?.personalInfo?.summary,
      skills: resume?.skills,
      experience: resume?.experience?.map(
        (e: { role: string; company: string; bullets: string[] }) => ({
          role: e.role,
          company: e.company,
          bullets: e.bullets,
        })
      ),
      education: resume?.education?.map(
        (ed: { institution: string; degree: string; field: string }) => ({
          institution: ed.institution,
          degree: ed.degree,
          field: ed.field,
        })
      ),
      projects: resume?.projects?.map(
        (p: { name: string; subtitle: string; bullets: string[] }) => ({
          name: p.name,
          subtitle: p.subtitle,
          bullets: p.bullets,
        })
      ),
      certifications: resume?.certifications,
      languages: resume?.languages,
    });

    const prompt = `You are an expert technical recruiter and resume advisor.
Compare the candidate's current resume against the target job description below and provide honest, contextual advice.

${FACT_PRESERVATION_RULES}

ADDITIONAL ATS INTEGRITY RULES:
1. NEVER claim or imply a guaranteed ATS pass or guaranteed interview. State clearly that scores are estimated alignment indicators.
2. NEVER invent missing skills or tell the candidate to fabricate skills they do not possess. For missing keywords from the job description, advise the candidate to add them ONLY if they genuinely have experience with those tools or concepts.
3. Link every actionable suggestion and bullet improvement to one of the 8 editable resume sections: "personal", "summary", "experience", "education", "skills", "projects", "certifications", or "languages".

DETERMINISTIC BASELINE METRICS:
- Deterministic Completeness Score: ${deterministic.completenessScore}%
- Deterministic Formatting Score: ${deterministic.formattingScore}%
- Deterministic Matched Keywords: ${deterministic.matchedKeywords.join(', ') || 'None'}
- Deterministic Missing Terms: ${deterministic.missingKeywords.join(', ') || 'None'}

CANDIDATE RESUME JSON:
${resumeSummaryText}

TARGET JOB DESCRIPTION:
${jobDescription.trim()}

Return a JSON object containing:
- jobTitle: The inferred title of the target job posting
- roleAlignmentScore: Estimated role & seniority alignment score (0 to 98, never 100)
- summaryFeedback: 2-3 honest, constructive sentences explaining how the candidate's existing background aligns with the job description and where they can clarify their real experience (never promising a guaranteed pass).
- matchedKeywords: Array of 5-14 specific skills, tools, or domain terms from the job description that ARE present in the candidate's resume.
- missingKeywords: Array of 4-10 relevant terms from the job description that do not appear in the resume yet (for the candidate to review and add ONLY if truthful).
- actionableSuggestions: Array of 3-5 concrete, contextual suggestions linked to specific resume sections ("personal", "summary", "experience", "education", "skills", "projects", "certifications", or "languages").
- bulletSuggestions: Array of 2-3 existing bullets from the candidate's experience or projects rewritten for clearer alignment with the job posting WITHOUT inventing any false skills, metrics, or credentials.`;

    const { response, usage: finalUsage } = await generateContentWithModelFallback(
      req,
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jobTitle: { type: Type.STRING },
              roleAlignmentScore: { type: Type.INTEGER },
              summaryFeedback: { type: Type.STRING },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionableSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    advice: { type: Type.STRING },
                    targetSection: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ['title', 'advice', 'targetSection', 'priority'],
                },
              },
              bulletSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    improved: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    targetSection: { type: Type.STRING },
                  },
                  required: ['original', 'improved', 'reason', 'targetSection'],
                },
              },
            },
            required: [
              'jobTitle',
              'roleAlignmentScore',
              'summaryFeedback',
              'matchedKeywords',
              'missingKeywords',
              'actionableSuggestions',
              'bulletSuggestions',
            ],
          },
        },
      },
      quota.usage
    );

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    const clampScore = (val: unknown, fallback = 75) => {
      const n = typeof val === 'number' ? Math.round(val) : fallback;
      return Math.max(10, Math.min(98, n));
    };

    // Merge deterministic + AI matched/missing keywords without duplicates
    const combinedMatched = Array.from(
      new Set([
        ...deterministic.matchedKeywords,
        ...(Array.isArray(parsed.matchedKeywords)
          ? parsed.matchedKeywords
              .map((k: unknown) => cleanValidatedString(k))
              .filter(Boolean)
          : []),
      ])
    ).slice(0, 16);

    const matchedLower = new Set(combinedMatched.map((k) => k.toLowerCase()));
    const combinedMissing = Array.from(
      new Set([
        ...deterministic.missingKeywords,
        ...(Array.isArray(parsed.missingKeywords)
          ? parsed.missingKeywords
              .map((k: unknown) => cleanValidatedString(k))
              .filter(Boolean)
          : []),
      ])
    )
      .filter((k) => !matchedLower.has(k.toLowerCase()))
      .slice(0, 12);

    const totalKw = combinedMatched.length + combinedMissing.length;
    const keywordCoverageScore =
      totalKw > 0
        ? Math.round((combinedMatched.length / totalKw) * 100)
        : deterministic.keywordCoverageScore;

    const roleAlignmentScore = clampScore(
      parsed.roleAlignmentScore,
      deterministic.completenessScore
    );

    const blendedEstimatedScore = clampScore(
      Math.round(
        deterministic.completenessScore * 0.35 +
          deterministic.formattingScore * 0.25 +
          keywordCoverageScore * 0.25 +
          roleAlignmentScore * 0.15
      )
    );

    return NextResponse.json({
      analysis: {
        jobTitle: cleanValidatedString(parsed.jobTitle, 'Target Role'),
        score: blendedEstimatedScore,
        roleAlignmentScore,
        impactMetricsScore: deterministic.formattingScore,
        keywordCoverageScore,
        summaryFeedback: cleanValidatedString(
          parsed.summaryFeedback,
          'Review your section completeness, formatting checks, and keyword alignment below.'
        ),
        matchedKeywords: combinedMatched,
        missingKeywords: combinedMissing,
        actionableSuggestions: Array.isArray(parsed.actionableSuggestions)
          ? parsed.actionableSuggestions
              .map((s: Record<string, unknown>) => ({
                title: cleanValidatedString(s?.title, 'Section Improvement'),
                advice: cleanValidatedString(s?.advice),
                targetSection: sanitizeSectionId(s?.targetSection, 'experience'),
                priority:
                  cleanValidatedString(s?.priority).toLowerCase() === 'high'
                    ? 'high'
                    : 'medium',
              }))
              .filter((s: { advice: string }) => s.advice.length > 5)
          : [],
        bulletSuggestions: Array.isArray(parsed.bulletSuggestions)
          ? parsed.bulletSuggestions
              .map((b: Record<string, unknown>) => ({
                original: cleanValidatedString(b?.original),
                improved: cleanValidatedString(b?.improved),
                reason: cleanValidatedString(b?.reason),
                targetSection: sanitizeSectionId(
                  b?.targetSection,
                  'experience'
                ),
              }))
              .filter(
                (b: { original: string; improved: string }) =>
                  b.original && b.improved
              )
          : [],
        analyzedAt: new Date().toISOString(),
      },
      usage: finalUsage,
    });
  } catch {
    if (!resumeData || !jdText) {
      return NextResponse.json(
        {
          error: 'Unable to analyze job description right now.',
          usage: quota.usage,
        },
        { status: 500 }
      );
    }

    const deterministic = evaluateResumeDeterministically(resumeData, jdText);
    const existingBullets =
      resumeData.experience?.flatMap((e) => e.bullets || []).filter(Boolean) ||
      [];
    const sampleBullets = existingBullets.slice(0, 2).map((b) => {
      const polished = buildFactSafeBulletVariations({
        bullet: b,
        role: resumeData?.personalInfo?.jobTitle || 'Professional',
        tone: 'impact',
        targetKeywords: deterministic.missingKeywords.slice(0, 2),
      })[0];
      return {
        original: b,
        improved: polished?.text || b,
        reason:
          'Strengthened action phrasing while preserving your exact stated facts.',
        targetSection: 'experience' as EditorSectionId,
      };
    });

    return NextResponse.json({
      analysis: {
        jobTitle: resumeData.personalInfo?.jobTitle || 'Target Role',
        score: deterministic.estimatedQualityScore,
        roleAlignmentScore: deterministic.completenessScore,
        impactMetricsScore: deterministic.formattingScore,
        keywordCoverageScore: deterministic.keywordCoverageScore,
        summaryFeedback: `Your resume matches ${deterministic.matchedKeywords.length} key terms from the job description with a ${deterministic.completenessScore}% section completeness score. Review any missing terms below and add them only where they reflect your real experience.`,
        matchedKeywords: deterministic.matchedKeywords,
        missingKeywords: deterministic.missingKeywords,
        actionableSuggestions: [
          ...(deterministic.missingKeywords.length > 0
            ? [
                {
                  title: 'Review Missing Job Description Keywords',
                  advice: `Consider adding relevant skills (${deterministic.missingKeywords.slice(0, 5).join(', ')}) to your Skills or Experience sections if you have hands-on experience with them.`,
                  targetSection: 'skills' as EditorSectionId,
                  priority: 'high' as const,
                },
              ]
            : []),
          {
            title: 'Tailor Professional Summary Headline',
            advice:
              'Align your opening summary sentence with the core competencies emphasized in the job posting.',
            targetSection: 'summary' as EditorSectionId,
            priority: 'medium' as const,
          },
        ],
        bulletSuggestions: sampleBullets,
        analyzedAt: new Date().toISOString(),
      },
      usage: quota.usage,
    });
  }
}
