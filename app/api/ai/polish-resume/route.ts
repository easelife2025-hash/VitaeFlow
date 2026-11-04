import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  verifyAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { buildFactSafeWholeResumePolish } from '@/lib/ai-fallback';
import {
  ResumeDraft,
  WholeResumePolishResult,
  WholeResumeBulletUpgrade,
  SuggestedSkillItem,
  SkillCategory,
} from '@/lib/types';

export const maxDuration = 60;

const VALID_CATEGORIES: SkillCategory[] = [
  'Core Technical',
  'Domain & Tools',
  'Transferable & Process',
];

export async function POST(req: NextRequest) {
  const quota = await verifyAndConsumeAiQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.errorMessage, usage: quota.usage },
      { status: quota.statusCode }
    );
  }

  let resumeDraft: ResumeDraft | null = null;

  try {
    const body = await req.json();
    resumeDraft = body?.resume as ResumeDraft;

    if (!resumeDraft || !resumeDraft.personalInfo) {
      return NextResponse.json(
        {
          error: 'Please provide your resume draft to run Whole-Resume AI Polish.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    const deterministicBaseline = buildFactSafeWholeResumePolish(resumeDraft);

    // Collect indexed bullets across Experience and Projects so AI can rewrite them with exact IDs
    const bulletItemsForPrompt: {
      id: string;
      section: 'experience' | 'projects';
      itemId: string;
      bulletIndex: number;
      contextLabel: string;
      original: string;
    }[] = [];

    for (const exp of resumeDraft.experience || []) {
      (exp.bullets || []).forEach((b, idx) => {
        if (b && b.trim().length >= 10 && bulletItemsForPrompt.length < 8) {
          bulletItemsForPrompt.push({
            id: `exp-${exp.id}-${idx}`,
            section: 'experience',
            itemId: exp.id,
            bulletIndex: idx,
            contextLabel: `${exp.role || 'Role'}${exp.company ? ` · ${exp.company}` : ''}`,
            original: b.trim(),
          });
        }
      });
    }

    for (const proj of resumeDraft.projects || []) {
      (proj.bullets || []).forEach((b, idx) => {
        if (b && b.trim().length >= 10 && bulletItemsForPrompt.length < 10) {
          bulletItemsForPrompt.push({
            id: `proj-${proj.id}-${idx}`,
            section: 'projects',
            itemId: proj.id,
            bulletIndex: idx,
            contextLabel: `Project · ${proj.name}`,
            original: b.trim(),
          });
        }
      });
    }

    const prompt = `You are a Principal Executive Resume Strategist. Analyze this candidate's ENTIRE resume holistically so every section (Summary, Experience, Projects, and Skills) reinforces a cohesive narrative.

${FACT_PRESERVATION_RULES}

CRITICAL REWRITING RULES:
1. For every bullet point in BULLETS TO UPGRADE, substantially restructure the sentence syntax, clause hierarchy (e.g., foregrounding measurable outcomes or architectural impact), and vocabulary so it is unmistakably stronger than the original. NEVER return the original sentence unchanged.
2. Synthesize an "improvedSummary" (2-3 high-impact sentences) that connects the candidate's target role, verified experience highlights, metrics, and skills.
3. Recommend up to 6 missing skills evidenced by their experience, projects, or education that are NOT already in Existing Skills.

CANDIDATE FULL RESUME:
- Target Role: ${cleanValidatedString(resumeDraft.personalInfo.jobTitle || resumeDraft.targetRole, 'Professional')}
- Current Summary: ${cleanValidatedString(resumeDraft.personalInfo.summary, 'None')}
- Existing Skills: ${(resumeDraft.skills || []).join(', ') || 'None'}
- Education: ${JSON.stringify(
      (resumeDraft.education || []).map((ed) => ({
        degree: ed.degree,
        field: ed.field,
        institution: ed.institution,
      }))
    )}
- Certifications: ${JSON.stringify(
      (resumeDraft.certifications || []).map((c) => c.name)
    )}
- Target Job Description (if any): ${cleanValidatedString(resumeDraft.jobDescriptionDraft).slice(0, 1200) || 'None'}

BULLETS TO UPGRADE:
${JSON.stringify(
  bulletItemsForPrompt.map((item) => ({
    id: item.id,
    contextLabel: item.contextLabel,
    original: item.original,
  }))
)}`;

    const { response, usage: finalUsage } = await generateContentWithModelFallback(
      req,
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              improvedSummary: { type: Type.STRING },
              summaryReasoning: { type: Type.STRING },
              bulletUpgrades: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    improved: { type: Type.STRING },
                    changeSummary: { type: Type.STRING },
                  },
                  required: ['id', 'improved', 'changeSummary'],
                },
              },
              recommendedSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    category: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ['skill', 'category', 'reason'],
                },
              },
              alignmentHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'improvedSummary',
              'summaryReasoning',
              'bulletUpgrades',
              'recommendedSkills',
              'alignmentHighlights',
            ],
          },
        },
      },
      quota.usage
    );

    const parsed = JSON.parse(response.text || '{}');

    const aiUpgradeMap = new Map<
      string,
      { improved: string; changeSummary: string }
    >();
    if (Array.isArray(parsed.bulletUpgrades)) {
      for (const item of parsed.bulletUpgrades) {
        const id = cleanValidatedString(item?.id);
        const improved = cleanValidatedString(item?.improved);
        const changeSummary = cleanValidatedString(
          item?.changeSummary,
          'Restructured clause order and elevated executive vocabulary.'
        );
        if (id && improved.length >= 12) {
          aiUpgradeMap.set(id, { improved, changeSummary });
        }
      }
    }

    const mergedBulletUpgrades: WholeResumeBulletUpgrade[] =
      bulletItemsForPrompt.map((src) => {
        const aiMatch = aiUpgradeMap.get(src.id);
        const baselineMatch = deterministicBaseline.bulletUpgrades.find(
          (b) => b.id === src.id
        );
        const normOrig = src.original.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normAi = (aiMatch?.improved || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        const useAi = Boolean(aiMatch && normAi && normAi !== normOrig);

        return {
          id: src.id,
          section: src.section,
          itemId: src.itemId,
          bulletIndex: src.bulletIndex,
          contextLabel: src.contextLabel,
          original: src.original,
          improved: useAi
            ? aiMatch!.improved
            : baselineMatch?.improved || src.original,
          changeSummary: useAi
            ? aiMatch!.changeSummary
            : baselineMatch?.changeSummary ||
              'Restructured phrasing for stronger executive impact.',
        };
      });

    const existingSkillSet = new Set(
      (resumeDraft.skills || []).map((s) => s.toLowerCase().trim())
    );
    const validatedSkills: SuggestedSkillItem[] = [];
    if (Array.isArray(parsed.recommendedSkills)) {
      for (const sk of parsed.recommendedSkills) {
        const name = cleanValidatedString(sk?.skill);
        const rawCat = cleanValidatedString(sk?.category) as SkillCategory;
        const category: SkillCategory = VALID_CATEGORIES.includes(rawCat)
          ? rawCat
          : 'Core Technical';
        if (
          name.length >= 2 &&
          !existingSkillSet.has(name.toLowerCase()) &&
          !validatedSkills.some(
            (v) => v.skill.toLowerCase() === name.toLowerCase()
          )
        ) {
          validatedSkills.push({
            skill: name,
            category,
            reason: cleanValidatedString(
              sk?.reason,
              'Evidenced by your work experience and projects.'
            ),
          });
        }
      }
    }

    const result: WholeResumePolishResult = {
      improvedSummary: cleanValidatedString(
        parsed.improvedSummary,
        deterministicBaseline.improvedSummary
      ),
      summaryReasoning: cleanValidatedString(
        parsed.summaryReasoning,
        deterministicBaseline.summaryReasoning
      ),
      bulletUpgrades: mergedBulletUpgrades,
      recommendedSkills:
        validatedSkills.length > 0
          ? validatedSkills.slice(0, 6)
          : deterministicBaseline.recommendedSkills,
      alignmentHighlights:
        Array.isArray(parsed.alignmentHighlights) &&
        parsed.alignmentHighlights.length > 0
          ? parsed.alignmentHighlights
              .map((h: unknown) => cleanValidatedString(h))
              .filter(Boolean)
              .slice(0, 4)
          : deterministicBaseline.alignmentHighlights,
    };

    return NextResponse.json({
      polishResult: result,
      usage: finalUsage,
    });
  } catch {
    if (!resumeDraft) {
      return NextResponse.json(
        {
          error: 'Unable to polish resume right now.',
          usage: quota.usage,
        },
        { status: 500 }
      );
    }

    const fallbackPolish = buildFactSafeWholeResumePolish(resumeDraft);
    return NextResponse.json({
      polishResult: fallbackPolish,
      usage: quota.usage,
    });
  }
}
