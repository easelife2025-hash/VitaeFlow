import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  getAiQuotaStatus,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { buildFactSafeSummaryVariations } from '@/lib/ai-fallback';
import { SummaryVariation } from '@/lib/types';

export const maxDuration = 60;

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

  let parsedBody: Record<string, unknown> = {};

  try {
    parsedBody = await req.json();
    const {
      jobTitle = '',
      currentSummary = '',
      experience = [],
      education = [],
      skills = [],
      projects = [],
    } = parsedBody;

    const expFacts = Array.isArray(experience)
      ? experience
          .slice(0, 4)
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
                ? e.bullets
                    .slice(0, 3)
                    .map((b) => cleanValidatedString(b))
                    .filter(Boolean)
                : [],
            })
          )
      : [];

    const eduFacts = Array.isArray(education)
      ? education.slice(0, 2).map(
          (ed: { degree?: string; field?: string; institution?: string }) =>
            `${cleanValidatedString(ed?.degree)} ${cleanValidatedString(ed?.field)} (${cleanValidatedString(ed?.institution)})`.trim()
        )
      : [];

    const skillFacts = Array.isArray(skills)
      ? skills
          .slice(0, 16)
          .map((s) => cleanValidatedString(s))
          .filter(Boolean)
      : [];

    const projFacts = Array.isArray(projects)
      ? projects
          .slice(0, 2)
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

    const prompt = `Generate 3 factual resume summaries based ONLY on these facts:
${FACT_PRESERVATION_RULES}
Role: ${cleanValidatedString(jobTitle, 'Professional')}
Draft: ${cleanValidatedString(currentSummary, 'None')}
Experience: ${JSON.stringify(expFacts)}
Skills: ${skillFacts.join(', ') || 'None'}
Education: ${eduFacts.join('; ') || 'None'}
Projects: ${projFacts.join('; ') || 'None'}

Return 3 variations:
1. "Executive Overview" (2-3 sentences)
2. "Results & Core Strengths" (2-3 sentences)
3. "Concise ATS Profile" (2 sentences)
Include brief "groundedFactsUsed" for each.`;

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
  } catch {
    const fallbackVariations = buildFactSafeSummaryVariations({
      jobTitle: String(parsedBody?.jobTitle || ''),
      currentSummary: String(parsedBody?.currentSummary || ''),
      experience: Array.isArray(parsedBody?.experience)
        ? (parsedBody.experience as Array<{
            role?: string;
            company?: string;
            startDate?: string;
            endDate?: string;
            bullets?: string[];
          }>)
        : [],
      education: Array.isArray(parsedBody?.education)
        ? (parsedBody.education as Array<{
            degree?: string;
            field?: string;
            institution?: string;
          }>)
        : [],
      skills: Array.isArray(parsedBody?.skills)
        ? (parsedBody.skills as string[])
        : [],
      projects: Array.isArray(parsedBody?.projects)
        ? (parsedBody.projects as Array<{ name?: string; subtitle?: string }>)
        : [],
    });

    return NextResponse.json({
      variations: fallbackVariations,
      usage: quota.usage,
    });
  }
}
