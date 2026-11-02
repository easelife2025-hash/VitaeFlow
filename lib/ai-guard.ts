import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { NextRequest } from 'next/server';
import { AiUsageMetadata } from './types';

export const GEMINI_MODEL = 'gemini-3.8-flash';

export const GEMINI_MODELS_CHAIN = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
] as const;

export type AllowedGeminiModelId = (typeof GEMINI_MODELS_CHAIN)[number]['id'];

export function getModelLabel(modelId: string): string {
  const found = GEMINI_MODELS_CHAIN.find((m) => m.id === modelId);
  return found ? found.label : modelId;
}

export const FACT_PRESERVATION_RULES = `
CRITICAL FACT-PRESERVATION & ANTI-HALLUCINATION RULES:
1. Preserve the user's exact factual history, roles, companies, tools, degrees, and stated accomplishments.
2. NEVER invent experience, qualifications, certifications, companies, projects, or degrees not present in the user's input.
3. NEVER fabricate numbers, percentages, dollar amounts, user counts, latency figures, or metrics that the user did not explicitly provide.
4. If the user's original text contains specific numbers or metrics, preserve them accurately. If the original text does NOT contain numbers, improve clarity, active voice, and verb strength WITHOUT inventing statistics or placeholder numbers.
5. Keep all wording truthful, professional, ATS-friendly, and directly grounded in the provided resume context.
`.trim();

export function getServerGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Server configuration error: GEMINI_API_KEY is not configured on the server.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface QuotaBucket {
  used: number;
  resetAtMs: number;
  modelIndex: number;
  switchedFromModel?: string;
}

const quotaStore = new Map<string, QuotaBucket>();

function getClientIdentifier(req: NextRequest): string {
  const sessionHeader = req.headers.get('x-ai-session-id');
  if (sessionHeader && sessionHeader.trim()) {
    return `session:${sessionHeader.trim().slice(0, 64)}`;
  }
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }
  return 'default-client';
}

export function getConfiguredLimit(req: NextRequest): number {
  const envDefault = parseInt(process.env.AI_MAX_REQUESTS_PER_HOUR || '50', 10);
  const serverMax = Number.isFinite(envDefault) && envDefault > 0 ? envDefault : 50;

  const customHeader = req.headers.get('x-ai-custom-limit');
  if (customHeader) {
    const parsedCustom = parseInt(customHeader, 10);
    if (Number.isFinite(parsedCustom) && parsedCustom >= 1 && parsedCustom <= 500) {
      return parsedCustom;
    }
  }
  return serverMax;
}

function getWindowMs(): number {
  const envMinutes = parseInt(process.env.AI_RATE_WINDOW_MINUTES || '60', 10);
  const minutes = Number.isFinite(envMinutes) && envMinutes > 0 ? envMinutes : 60;
  return minutes * 60 * 1000;
}

export function checkAndConsumeAiQuota(req: NextRequest): {
  allowed: boolean;
  usage: AiUsageMetadata;
  errorMessage?: string;
} {
  const clientId = getClientIdentifier(req);
  const limit = getConfiguredLimit(req);
  const windowMs = getWindowMs();
  const now = Date.now();

  if (req.headers.get('x-ai-reset-quota') === 'true') {
    quotaStore.delete(clientId);
  }

  let bucket = quotaStore.get(clientId);
  if (!bucket || now >= bucket.resetAtMs) {
    bucket = {
      used: 0,
      resetAtMs: now + windowMs,
      modelIndex: 0,
      switchedFromModel: undefined,
    };
  }

  // Automatic model rollover: if the current model reaches its per-model request limit,
  // automatically switch to the next Gemini model in GEMINI_MODELS_CHAIN and reset the counter
  // so the user is never blocked by an "AI usage limit exceeded" error.
  if (bucket.used >= limit) {
    const previousModel = GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
    const nextIndex = (bucket.modelIndex + 1) % GEMINI_MODELS_CHAIN.length;
    bucket = {
      used: 0,
      resetAtMs: now + windowMs,
      modelIndex: nextIndex,
      switchedFromModel: previousModel.label,
    };
  }

  bucket.used += 1;
  quotaStore.set(clientId, bucket);

  const currentModel = GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];

  return {
    allowed: true,
    usage: {
      used: bucket.used,
      limit,
      remaining: Math.max(0, limit - bucket.used),
      resetAt: new Date(bucket.resetAtMs).toISOString(),
      activeModel: currentModel.id,
      activeModelLabel: currentModel.label,
      switchedFromModel: bucket.switchedFromModel,
      autoSwitchEnabled: true,
    },
  };
}

export function getAiQuotaStatus(req: NextRequest): AiUsageMetadata {
  const clientId = getClientIdentifier(req);
  const limit = getConfiguredLimit(req);
  const windowMs = getWindowMs();
  const now = Date.now();

  if (req.headers.get('x-ai-reset-quota') === 'true') {
    quotaStore.delete(clientId);
  }

  let bucket = quotaStore.get(clientId);
  if (!bucket || now >= bucket.resetAtMs) {
    const defaultModel = GEMINI_MODELS_CHAIN[0];
    return {
      used: 0,
      limit,
      remaining: limit,
      resetAt: new Date(now + windowMs).toISOString(),
      activeModel: defaultModel.id,
      activeModelLabel: defaultModel.label,
      autoSwitchEnabled: true,
    };
  }

  // If a user previously hit used >= limit before auto-switch was enabled, roll over immediately on status check
  if (bucket.used >= limit) {
    const previousModel = GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
    const nextIndex = (bucket.modelIndex + 1) % GEMINI_MODELS_CHAIN.length;
    bucket = {
      used: 0,
      resetAtMs: now + windowMs,
      modelIndex: nextIndex,
      switchedFromModel: previousModel.label,
    };
    quotaStore.set(clientId, bucket);
  }

  const currentModel = GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];

  return {
    used: bucket.used,
    limit,
    remaining: Math.max(0, limit - bucket.used),
    resetAt: new Date(bucket.resetAtMs).toISOString(),
    activeModel: currentModel.id,
    activeModelLabel: currentModel.label,
    switchedFromModel: bucket.switchedFromModel,
    autoSwitchEnabled: true,
  };
}

/**
 * Calls Gemini generateContent with automatic model failover across GEMINI_MODELS_CHAIN.
 * If the currently active model hits an upstream rate limit (429 / RESOURCE_EXHAUSTED) or transient failure,
 * it automatically switches to the next available model and updates the client's quota state.
 */
export async function generateContentWithModelFallback(
  req: NextRequest,
  params: Omit<GenerateContentParameters, 'model'>,
  initialUsage: AiUsageMetadata
): Promise<{
  response: GenerateContentResponse;
  usage: AiUsageMetadata;
}> {
  const ai = getServerGeminiClient();
  const clientId = getClientIdentifier(req);
  const limit = getConfiguredLimit(req);
  const windowMs = getWindowMs();
  const now = Date.now();

  let bucket = quotaStore.get(clientId) || {
    used: initialUsage.used || 1,
    resetAtMs: now + windowMs,
    modelIndex: 0,
  };

  const startIndex = bucket.modelIndex % GEMINI_MODELS_CHAIN.length;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < GEMINI_MODELS_CHAIN.length; attempt++) {
    const candidateIndex = (startIndex + attempt) % GEMINI_MODELS_CHAIN.length;
    const candidateModel = GEMINI_MODELS_CHAIN[candidateIndex];

    try {
      const response = await ai.models.generateContent({
        ...params,
        model: candidateModel.id,
      });

      // If we had to fall back to a subsequent model due to an upstream error, persist the switch
      if (attempt > 0) {
        const prevModel = GEMINI_MODELS_CHAIN[startIndex];
        bucket = {
          used: 1,
          resetAtMs: now + windowMs,
          modelIndex: candidateIndex,
          switchedFromModel: prevModel.label,
        };
        quotaStore.set(clientId, bucket);
      }

      return {
        response,
        usage: {
          used: bucket.used,
          limit,
          remaining: Math.max(0, limit - bucket.used),
          resetAt: new Date(bucket.resetAtMs).toISOString(),
          activeModel: candidateModel.id,
          activeModelLabel: candidateModel.label,
          switchedFromModel: bucket.switchedFromModel,
          autoSwitchEnabled: true,
        },
      };
    } catch (err: unknown) {
      lastError = err;
      // Continue loop to try the next model in GEMINI_MODELS_CHAIN
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All Gemini models in the fallback chain are temporarily busy. Please try again in a moment.');
}

export function cleanValidatedString(val: unknown, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  return val.trim();
}
