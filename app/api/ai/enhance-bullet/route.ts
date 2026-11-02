import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { buildFactSafeBulletVariations } from '@/lib/ai-fallback';
import {
  EnhancedBulletVariation,
  BulletTone,
  AiEnhancerMode,
} from '@/lib/types';

export const maxDuration = 60;

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
      bullet,
      role = 'Professional',
      company = '',
      tone = 'impact',
      mode = 'rewrite_bullet',
      targetKeywords = [],
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

    const toneInstructions: Record<string, string> = {
      impact:
        'Emphasize concrete outcomes and strong action verbs while strictly preserving only stated facts and numbers.',
      leadership:
        'Emphasize ownership, collaboration, and execution clarity without inventing supervisory scope.',
      concise:
        'Make it crisp, high-density, ATS-friendly, and scannable without filler words.',
      clarity:
        'Polish grammar, sentence flow, professional phrasing, and active voice while keeping the exact meaning intact.',
    };

    const isImproveWording = mode === 'improve_wording';
    const toneKey = String(tone || 'impact');

    const prompt = `${
      isImproveWording
        ? `Polish wording and clarity for a "${cleanValidatedString(role, 'Professional')}" resume${company ? ` (${cleanValidatedString(company)})` : ''}.`
        : `Rewrite this resume bullet for a "${cleanValidatedString(role, 'Professional')}" role${company ? ` at "${cleanValidatedString(company)}"` : ''}.`
    }
${FACT_PRESERVATION_RULES}
Original: "${cleanBullet}"
Focus: ${toneInstructions[toneKey] || toneInstructions.impact}
${
  Array.isArray(targetKeywords) && targetKeywords.length > 0
    ? `Optional keywords if truthful: ${targetKeywords
        .slice(0, 4)
        .map((k) => cleanValidatedString(k))
        .filter(Boolean)
        .join(', ')}`
    : ''
}
Return 3 distinct, 100% fact-preserving variations:
1. Action & Outcome Focus
2. Polished Professional Wording
3. Concise ATS Version`;

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

    const validatedVariations: EnhancedBulletVariation[] = rawList
      .map((v: Record<string, unknown>) => ({
        toneLabel: cleanValidatedString(v?.toneLabel, 'Polished Variation'),
        actionVerb: cleanValidatedString(v?.actionVerb, 'Led'),
        text: cleanValidatedString(v?.text),
        metricsAdded: cleanValidatedString(
          v?.metricsAdded,
          'Strengthened phrasing while preserving your stated facts.'
        ),
      }))
      .filter((v: EnhancedBulletVariation) => v.text.length >= 10)
      .slice(0, 3);

    if (validatedVariations.length === 0) {
      throw new Error(
        'AI response validation failed: No valid wording variations were generated.'
      );
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
    });

    return NextResponse.json({
      variations: fallbackVariations,
      usage: quota.usage,
    });
  }
}
