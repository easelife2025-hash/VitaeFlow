import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { EnhancedBulletVariation } from '@/lib/types';

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
      bullet,
      role = 'Professional',
      company = '',
      tone = 'impact',
      mode = 'rewrite_bullet',
      targetKeywords = [],
    } = body;

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
        'Emphasize concrete outcomes and strong action verbs while strictly preserving only facts and numbers already stated in the original text.',
      leadership:
        'Emphasize ownership, collaboration, and execution clarity without inventing supervisory scope or false titles.',
      concise:
        'Make it crisp, high-density, ATS-friendly, and scannable in one to two lines without filler words.',
      clarity:
        'Polish grammar, sentence flow, professional phrasing, and active voice while keeping the exact meaning intact.',
    };

    const isImproveWording = mode === 'improve_wording';

    const prompt = `You are an executive resume editor and ATS optimization specialist.
${
  isImproveWording
    ? `Improve the wording, grammar, flow, and professional tone of the following text for a "${cleanValidatedString(role, 'Professional')}" resume${company ? ` (${cleanValidatedString(company)})` : ''}.`
    : `Rewrite the following resume bullet point for a "${cleanValidatedString(role, 'Professional')}" role${company ? ` at "${cleanValidatedString(company)}"` : ''}.`
}

${FACT_PRESERVATION_RULES}

ORIGINAL USER TEXT:
"${cleanBullet}"

REQUESTED FOCUS:
${toneInstructions[tone] || toneInstructions.impact}
${
  Array.isArray(targetKeywords) && targetKeywords.length > 0
    ? `If truthful and naturally fitting the original statement, you may incorporate 1 of these keywords: ${targetKeywords
        .slice(0, 5)
        .map((k) => cleanValidatedString(k))
        .filter(Boolean)
        .join(', ')}`
    : ''
}

Return exactly 3 distinct, fact-preserving variations:
1. Strong Action & Outcome Focus (preserves exact facts; never invents numbers)
2. Polished Professional Wording & Flow
3. Concise High-Clarity ATS Version

Ensure every variation is 100% faithful to the user's original facts. In "metricsAdded", explain what wording, verb, or structural improvement was made and confirm that no unverified metrics were invented.`;

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
                    toneLabel: {
                      type: Type.STRING,
                      description: 'Short label for the style, e.g., Action & Outcome',
                    },
                    actionVerb: {
                      type: Type.STRING,
                      description: 'The lead verb or key opening word used',
                    },
                    text: {
                      type: Type.STRING,
                      description: 'The complete rewritten or polished text',
                    },
                    metricsAdded: {
                      type: Type.STRING,
                      description:
                        'Note on how wording/clarity was improved while preserving the user facts',
                    },
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to rewrite or improve wording with AI.';
    return NextResponse.json(
      { error: message, usage: quota.usage },
      { status: 500 }
    );
  }
}
