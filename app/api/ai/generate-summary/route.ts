import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  getAiQuotaStatus,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { SummaryVariation } from '@/lib/types';

export async function GET(req: NextRequest) {
  const usage = getAiQuotaStatus(req);
  return NextResponse.json({ usage });
}

export async function POST(req: NextRequest) {
  const quota = checkAndConsumeAiQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.errorMessage, usage: quota.usage },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      jobTitle = '',
      currentSummary = '',
      experience = [],
      education = [],
      skills = [],
      projects = [],
    } = body;

    const expFacts = Array.isArray(experience)
      ? experience
          .slice(0, 5)
          .map(
            (e: {
              role?: string;
              company?: string;
              startDate?: string;
              endDate?: string;
              bullets?: string[];
            }) => ({
              role: cleanValidatedString(e?.role),
              company: cleanValidatedString(e?.company),
              dates: `${cleanValidatedString(e?.startDate)} - ${cleanValidatedString(e?.endDate)}`,
              bullets: Array.isArray(e?.bullets)
                ? e.bullets.map((b) => cleanValidatedString(b)).filter(Boolean)
                : [],
            })
          )
      : [];

    const eduFacts = Array.isArray(education)
      ? education.slice(0, 3).map(
          (ed: { degree?: string; field?: string; institution?: string }) =>
            `${cleanValidatedString(ed?.degree)} ${cleanValidatedString(ed?.field)} (${cleanValidatedString(ed?.institution)})`.trim()
        )
      : [];

    const skillFacts = Array.isArray(skills)
      ? skills
          .slice(0, 20)
          .map((s) => cleanValidatedString(s))
          .filter(Boolean)
      : [];

    const projFacts = Array.isArray(projects)
      ? projects
          .slice(0, 3)
          .map((p: { name?: string; subtitle?: string }) =>
            `${cleanValidatedString(p?.name)}: ${cleanValidatedString(p?.subtitle)}`.trim()
          )
      : [];

    if (
      !cleanValidatedString(jobTitle) &&
      !cleanValidatedString(currentSummary) &&
      expFacts.length === 0 &&
      skillFacts.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Please fill in your Target Role, Experience, or Skills first so AI can generate a factual summary.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    const prompt = `You are a senior career strategist and ATS resume specialist.
Generate 3 distinct, factual professional resume summaries for this candidate based ONLY on the facts supplied below.

${FACT_PRESERVATION_RULES}

CANDIDATE FACTS FROM RESUME:
- Target Role / Headline: ${cleanValidatedString(jobTitle, 'Professional')}
- Current Draft Summary (if any): ${cleanValidatedString(currentSummary, 'None')}
- Work Experience History: ${JSON.stringify(expFacts)}
- Skills: ${skillFacts.join(', ') || 'None listed'}
- Education: ${eduFacts.join('; ') || 'None listed'}
- Projects: ${projFacts.join('; ') || 'None listed'}

Return exactly 3 variations:
1. "Executive Overview" (2-3 polished sentences synthesizing role, domain, and actual experience highlights)
2. "Results & Core Strengths" (2-3 high-clarity sentences emphasizing verified skills and stated accomplishments)
3. "Concise ATS Profile" (A crisp 2-sentence summary optimized for quick recruiter scanning)

For each variation, also provide "groundedFactsUsed" listing the exact facts from the candidate's input that were referenced (confirming zero invented claims or metrics).`;

    const { response, usage: finalUsage } = await generateContentWithModelFallback(
      req,
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleLabel: { type: Type.STRING },
                    summaryText: { type: Type.STRING },
                    groundedFactsUsed: { type: Type.STRING },
                  },
                  required: ['styleLabel', 'summaryText', 'groundedFactsUsed'],
                },
              },
            },
            required: ['variations'],
          },
        },
      },
      quota.usage
    );

    const parsed = JSON.parse(response.text || '{}');
    const rawList = Array.isArray(parsed.variations) ? parsed.variations : [];

    const validatedVariations: SummaryVariation[] = rawList
      .map((item: Record<string, unknown>) => ({
        styleLabel: cleanValidatedString(item?.styleLabel, 'Professional Summary'),
        summaryText: cleanValidatedString(item?.summaryText),
        groundedFactsUsed: cleanValidatedString(
          item?.groundedFactsUsed,
          'Grounded strictly in your provided resume sections.'
        ),
      }))
      .filter((v: SummaryVariation) => v.summaryText.length >= 20)
      .slice(0, 3);

    if (validatedVariations.length === 0) {
      throw new Error('AI response validation failed: No valid summary variations returned.');
    }

    return NextResponse.json({
      variations: validatedVariations,
      usage: finalUsage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate professional summary.';
    return NextResponse.json(
      { error: message, usage: quota.usage },
      { status: 500 }
    );
  }
}
