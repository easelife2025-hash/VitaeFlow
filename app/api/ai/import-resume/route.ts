import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  FACT_PRESERVATION_RULES,
  checkAndConsumeAiQuota,
  generateContentWithModelFallback,
} from '@/lib/ai-guard';

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
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json(
        {
          error: 'Please provide resume text to import and structure.',
          usage: quota.usage,
        },
        { status: 400 }
      );
    }

    const prompt = `You are an expert resume parser. Extract structured resume fields from the raw resume text below.
${FACT_PRESERVATION_RULES}
If any field is missing from the source text, provide an empty string or empty array without inventing false credentials, dates, or achievements.
For language proficiency, use one of: "Native / Bilingual", "Full Professional", "Professional Working", "Conversational", or "Elementary".

RAW RESUME TEXT:
${rawText.trim()}`;

    const { response, usage: finalUsage } = await generateContentWithModelFallback(
      req,
      {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              personalInfo: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  website: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: [
                  'fullName',
                  'jobTitle',
                  'email',
                  'phone',
                  'location',
                  'website',
                  'linkedin',
                  'summary',
                ],
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    current: { type: Type.BOOLEAN },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'company',
                    'role',
                    'location',
                    'startDate',
                    'endDate',
                    'current',
                    'bullets',
                  ],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    field: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    gpa: { type: Type.STRING },
                  },
                  required: [
                    'institution',
                    'degree',
                    'field',
                    'location',
                    'startDate',
                    'endDate',
                  ],
                },
              },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    link: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['name', 'subtitle', 'link', 'bullets'],
                },
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    date: { type: Type.STRING },
                    credentialId: { type: Type.STRING },
                  },
                  required: ['name', 'issuer', 'date'],
                },
              },
              languages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    language: { type: Type.STRING },
                    proficiency: { type: Type.STRING },
                  },
                  required: ['language', 'proficiency'],
                },
              },
            },
            required: [
              'title',
              'personalInfo',
              'experience',
              'education',
              'skills',
              'projects',
              'certifications',
              'languages',
            ],
          },
        },
      },
      quota.usage
    );

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json({ parsed, usage: finalUsage });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to parse imported resume text.';
    return NextResponse.json(
      { error: message, usage: quota.usage },
      { status: 500 }
    );
  }
}
