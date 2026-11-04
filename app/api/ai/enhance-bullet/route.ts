import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  verifyAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { buildFactSafeBulletVariations } from '@/lib/ai-fallback';
import {
  EnhancedBulletVariation,
  BulletTone,
  AiEnhancerMode,
  WholeResumeContextSnapshot,
} from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const quota = await verifyAndConsumeAiQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.errorMessage, usage: quota.usage },
      { status: quota.statusCode }
    );
  }

  let parsedBody: Record<string, unknown> = {};

  try {
    parsedBody = await req.json();
    const {
      bullet,
      role = 'Professional',
      company = '',
      tone = 'impact',
      mode = 'rewrite_bullet',
      targetKeywords = [],
      resumeContext,
    } = parsedBody;

    const cleanBullet = cleanValidatedString(bullet);
    if (!cleanBullet || cleanBullet.length < 4) {
      return NextResponse.json(
        {
          error: 'Please provide a bullet point or sentence to rewrite or improve.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    const ctx = (resumeContext || {}) as WholeResumeContextSnapshot;
    const ctxSkills = Array.isArray(ctx.skills)
      ? ctx.skills.slice(0, 15).join(', ')
      : '';
    const ctxRoles = Array.isArray(ctx.experience)
      ? ctx.experience
          .slice(0, 3)
          .map((e) => `${e.role || ''} at ${e.company || ''}`.trim())
          .filter(Boolean)
          .join('; ')
      : '';
    const ctxProjects = Array.isArray(ctx.projects)
      ? ctx.projects
          .slice(0, 2)
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : '';

    const toneInstructions: Record<string, string> = {
      impact:
        'Invert or restructure clauses to foreground the measurable outcome/result first, using commanding executive action verbs.',
      leadership:
        'Restructure around strategic ownership, cross-functional alignment, and execution authority.',
      concise:
        'Condense and tighten phrasing into a punchy, high-density ATS statement with zero filler words.',
      clarity:
        'Substantially elevate sentence flow, active voice, and executive vocabulary while preserving exact facts.',
    };

    const isImproveWording = mode === 'improve_wording';
    const toneKey = String(tone || 'impact');

    const fallbackList = buildFactSafeBulletVariations({
      bullet: cleanBullet,
      role: cleanValidatedString(role, ctx.jobTitle || 'Professional'),
      company: cleanValidatedString(company),
      tone: (toneKey as BulletTone) || 'impact',
      mode: (mode as AiEnhancerMode) || 'rewrite_bullet',
      targetKeywords: Array.isArray(targetKeywords)
        ? (targetKeywords as string[])
        : [],
      resumeContext: ctx,
    });

    const prompt = `You are an executive resume strategist. ${
      isImproveWording
        ? `Substantially rewrite and elevate the wording, structure, and flow of this text for a "${cleanValidatedString(role, ctx.jobTitle || 'Professional')}" resume${company ? ` (${cleanValidatedString(company)})` : ''}.`
        : `Substantially rewrite and restructure this resume bullet point for a "${cleanValidatedString(role, ctx.jobTitle || 'Professional')}" role${company ? ` at "${cleanValidatedString(company)}"` : ''}.`
    }

${FACT_PRESERVATION_RULES}

CRITICAL REWRITING REQUIREMENT:
- NEVER return the original text unchanged or with only 1-2 words swapped.
- Every variation MUST substantially restructure the sentence syntax, clause order, and vocabulary so the user sees a clear, high-value improvement over their original draft while keeping 100% of their real facts and numbers accurate.

WHOLE-RESUME CONTEXT (Use to align terminology and seniority):
- Target Headline: ${cleanValidatedString(ctx.jobTitle || role, 'Professional')}
- Candidate Skills: ${ctxSkills || 'Not specified'}
- Career Roles: ${ctxRoles || 'Not specified'}
- Projects: ${ctxProjects || 'Not specified'}

ORIGINAL USER TEXT:
"${cleanBullet}"

REQUESTED FOCUS:
${toneInstructions[toneKey] || toneInstructions.impact}
${
  Array.isArray(targetKeywords) && targetKeywords.length > 0
    ? `Optional ATS terms if truthful to the statement: ${targetKeywords
        .slice(0, 4)
        .map((k) => cleanValidatedString(k))
        .filter(Boolean)
        .join(', ')}`
    : ''
}

Return 3 genuinely distinct, restructured variations:
1. "Outcome-First Impact" (Restructures the sentence to foreground the measurable result or deliverable impact first)
2. "Executive & Domain Authority" (Elevates vocabulary, technical/domain precision, and cross-functional framing)
3. "Concise High-Density ATS" (Tightens syntax into a crisp, high-signal ATS achievement statement)
In "metricsAdded", briefly state how the clause structure and vocabulary were transformed.`;

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
                    toneLabel: { type: Type.STRING },
                    actionVerb: { type: Type.STRING },
                    text: { type: Type.STRING },
                    metricsAdded: { type: Type.STRING },
                  },
                  required: ['toneLabel', 'actionVerb', 'text', 'metricsAdded'],
                },
              },
            },
            required: ['variations'],
          },
        },
      },
      quota.usage
    );

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);
    const rawList = Array.isArray(parsed.variations) ? parsed.variations : [];

    const normalizedOrig = cleanBullet
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const validatedVariations: EnhancedBulletVariation[] = rawList
      .map((v: Record<string, unknown>, idx: number) => {
        const candidateText = cleanValidatedString(v?.text);
        const normalizedCand = candidateText
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        // Guarantee the variation is never identical to the original text
        if (!candidateText || normalizedCand === normalizedOrig) {
          return fallbackList[idx] || fallbackList[0];
        }

        return {
          toneLabel: cleanValidatedString(
            v?.toneLabel,
            fallbackList[idx]?.toneLabel || 'Polished Variation'
          ),
          actionVerb: cleanValidatedString(
            v?.actionVerb,
            candidateText.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') || 'Led'
          ),
          text: candidateText,
          metricsAdded: cleanValidatedString(
            v?.metricsAdded,
            'Restructured phrasing and elevated vocabulary while preserving your stated facts.'
          ),
        };
      })
      .filter((v: EnhancedBulletVariation) => Boolean(v && v.text.length >= 10))
      .slice(0, 3);

    if (validatedVariations.length === 0) {
      return NextResponse.json({
        variations: fallbackList,
        usage: finalUsage,
      });
    }

    return NextResponse.json({
      variations: validatedVariations,
      usage: finalUsage,
    });
  } catch {
    const fallbackVariations = buildFactSafeBulletVariations({
      bullet: String(parsedBody?.bullet || ''),
      role: String(parsedBody?.role || 'Professional'),
      company: String(parsedBody?.company || ''),
      tone: (parsedBody?.tone as BulletTone) || 'impact',
      mode: (parsedBody?.mode as AiEnhancerMode) || 'rewrite_bullet',
      targetKeywords: Array.isArray(parsedBody?.targetKeywords)
        ? (parsedBody.targetKeywords as string[])
        : [],
      resumeContext: (parsedBody?.resumeContext || {}) as WholeResumeContextSnapshot,
    });

    return NextResponse.json({
      variations: fallbackVariations,
      usage: quota.usage,
    });
  }
}
