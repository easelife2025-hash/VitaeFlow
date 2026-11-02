import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { SuggestedSkillItem, SkillCategory } from '@/lib/types';

const VALID_CATEGORIES: SkillCategory[] = [
  'Core Technical',
  'Domain & Tools',
  'Transferable & Process',
];

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
      summary = '',
      experience = [],
      projects = [],
      education = [],
      existingSkills = [],
    } = body;

    const currentSkillsList: string[] = Array.isArray(existingSkills)
      ? existingSkills.map((s) => cleanValidatedString(s)).filter(Boolean)
      : [];

    const expContext = Array.isArray(experience)
      ? experience.slice(0, 5).map(
          (e: { role?: string; company?: string; bullets?: string[] }) => ({
            role: cleanValidatedString(e?.role),
            company: cleanValidatedString(e?.company),
            bullets: Array.isArray(e?.bullets)
              ? e.bullets.map((b) => cleanValidatedString(b)).filter(Boolean)
              : [],
          })
        )
      : [];

    const projContext = Array.isArray(projects)
      ? projects.slice(0, 4).map(
          (p: { name?: string; subtitle?: string; bullets?: string[] }) => ({
            name: cleanValidatedString(p?.name),
            subtitle: cleanValidatedString(p?.subtitle),
            bullets: Array.isArray(p?.bullets)
              ? p.bullets.map((b) => cleanValidatedString(b)).filter(Boolean)
              : [],
          })
        )
      : [];

    const eduContext = Array.isArray(education)
      ? education.slice(0, 3).map(
          (ed: { degree?: string; field?: string }) =>
            `${cleanValidatedString(ed?.degree)} ${cleanValidatedString(ed?.field)}`.trim()
        )
      : [];

    if (
      !cleanValidatedString(jobTitle) &&
      expContext.length === 0 &&
      projContext.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Add a Target Role, Work Experience, or Project first so AI can suggest skills grounded in your background.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    const prompt = `You are a technical recruiter and ATS curriculum specialist.
Analyze the candidate's existing resume facts below and suggest 8 relevant skills or ATS keywords that naturally align with their actual work experience, projects, education, and target role.

${FACT_PRESERVATION_RULES}

ADDITIONAL RULES FOR SKILL SUGGESTIONS:
- Do NOT suggest any skill that is already in the candidate's Existing Skills list (${currentSkillsList.join(', ') || 'None'}).
- Only suggest skills that are directly evidenced by or strongly complementary to the candidate's stated experience, projects, or degree. Never suggest unrelated licenses or unverified certifications.
- Categorize each suggested skill into one of: "Core Technical", "Domain & Tools", or "Transferable & Process".
- Provide a brief 1-sentence "reason" explaining which part of the candidate's resume supports this skill.

CANDIDATE RESUME CONTEXT:
- Target Role: ${cleanValidatedString(jobTitle, 'Professional')}
- Summary: ${cleanValidatedString(summary)}
- Work Experience: ${JSON.stringify(expContext)}
- Projects: ${JSON.stringify(projContext)}
- Education: ${eduContext.join('; ')}
- Existing Skills (Exclude these): ${currentSkillsList.join(', ')}`;

    const { response, usage: finalUsage } = await generateContentWithModelFallback(
      req,
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
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
            },
            required: ['suggestions'],
          },
        },
      },
      quota.usage
    );

    const parsed = JSON.parse(response.text || '{}');
    const rawList = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const lowerExisting = new Set(currentSkillsList.map((s) => s.toLowerCase()));

    const validatedSuggestions: SuggestedSkillItem[] = [];
    const seen = new Set<string>();

    for (const item of rawList) {
      const skillName = cleanValidatedString(item?.skill);
      const rawCategory = cleanValidatedString(item?.category) as SkillCategory;
      const category: SkillCategory = VALID_CATEGORIES.includes(rawCategory)
        ? rawCategory
        : 'Core Technical';
      const reason = cleanValidatedString(
        item?.reason,
        'Aligned with your stated role and experience.'
      );

      const key = skillName.toLowerCase();
      if (
        skillName.length >= 2 &&
        skillName.length <= 45 &&
        !lowerExisting.has(key) &&
        !seen.has(key)
      ) {
        seen.add(key);
        validatedSuggestions.push({
          skill: skillName,
          category,
          reason,
        });
      }
    }

    if (validatedSuggestions.length === 0) {
      throw new Error(
        'AI response validation failed: No new skill suggestions were returned.'
      );
    }

    return NextResponse.json({
      suggestions: validatedSuggestions.slice(0, 9),
      usage: finalUsage,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to suggest relevant skills.';
    return NextResponse.json(
      { error: message, usage: quota.usage },
      { status: 500 }
    );
  }
}
