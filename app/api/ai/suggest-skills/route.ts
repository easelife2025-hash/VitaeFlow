import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  verifyAndConsumeAiQuota,
  generateContentWithModelFallback,
  cleanValidatedString,
} from '@/lib/ai-guard';
import { buildFactSafeSkillSuggestions } from '@/lib/ai-fallback';
import { SuggestedSkillItem, SkillCategory } from '@/lib/types';

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

  let parsedBody: Record<string, unknown> = {};

  try {
    parsedBody = await req.json();
    const {
      jobTitle = '',
      summary = '',
      experience = [],
      projects = [],
      education = [],
      certifications = [],
      jobDescriptionDraft = '',
      existingSkills = [],
    } = parsedBody;

    const currentSkillsList: string[] = Array.isArray(existingSkills)
      ? existingSkills.map((s) => cleanValidatedString(s)).filter(Boolean)
      : [];

    const expContext = Array.isArray(experience)
      ? experience.slice(0, 4).map(
          (e: { role?: string; company?: string; bullets?: string[] }) => ({
            role: cleanValidatedString(e?.role),
            company: cleanValidatedString(e?.company),
            bullets: Array.isArray(e?.bullets)
              ? e.bullets
                  .slice(0, 3)
                  .map((b) => cleanValidatedString(b))
                  .filter(Boolean)
              : [],
          })
        )
      : [];

    const projContext = Array.isArray(projects)
      ? projects.slice(0, 3).map(
          (p: { name?: string; subtitle?: string; bullets?: string[] }) => ({
            name: cleanValidatedString(p?.name),
            subtitle: cleanValidatedString(p?.subtitle),
            bullets: Array.isArray(p?.bullets)
              ? p.bullets
                  .slice(0, 2)
                  .map((b) => cleanValidatedString(b))
                  .filter(Boolean)
              : [],
          })
        )
      : [];

    const eduContext = Array.isArray(education)
      ? education.slice(0, 2).map(
          (ed: { degree?: string; field?: string }) =>
            `${cleanValidatedString(ed?.degree)} ${cleanValidatedString(ed?.field)}`.trim()
        )
      : [];

    const certContext = Array.isArray(certifications)
      ? certifications
          .slice(0, 3)
          .map((c: { name?: string }) => cleanValidatedString(c?.name))
          .filter(Boolean)
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

    const prompt = `Analyze this candidate's ENTIRE resume and suggest 8 high-signal ATS skills evidenced by their experience, projects, education, certifications, and target role.
${FACT_PRESERVATION_RULES}
Exclude existing skills: ${currentSkillsList.join(', ') || 'None'}
Categories: "Core Technical", "Domain & Tools", "Transferable & Process"
Role: ${cleanValidatedString(jobTitle, 'Professional')}
Summary: ${cleanValidatedString(summary)}
Experience: ${JSON.stringify(expContext)}
Projects: ${JSON.stringify(projContext)}
Education: ${eduContext.join('; ')}
Certifications: ${certContext.join('; ')}
Target Job Context: ${cleanValidatedString(jobDescriptionDraft).slice(0, 600) || 'None'}`;

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
  } catch {
    const fallbackSuggestions = buildFactSafeSkillSuggestions({
      jobTitle: String(parsedBody?.jobTitle || ''),
      summary: String(parsedBody?.summary || ''),
      experience: Array.isArray(parsedBody?.experience)
        ? (parsedBody.experience as Array<{
            role?: string;
            company?: string;
            bullets?: string[];
          }>)
        : [],
      projects: Array.isArray(parsedBody?.projects)
        ? (parsedBody.projects as Array<{
            name?: string;
            subtitle?: string;
            bullets?: string[];
          }>)
        : [],
      education: Array.isArray(parsedBody?.education)
        ? (parsedBody.education as Array<{ degree?: string; field?: string }>)
        : [],
      existingSkills: Array.isArray(parsedBody?.existingSkills)
        ? (parsedBody.existingSkills as string[])
        : [],
    });

    return NextResponse.json({
      suggestions: fallbackSuggestions,
      usage: quota.usage,
    });
  }
}
