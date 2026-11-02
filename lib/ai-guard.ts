import {
  GoogleGenAI,
  GenerateContentParameters,
  GenerateContentResponse,
  ThinkingLevel,
} from '@google/genai';
import { NextRequest } from 'next/server';
import { AiUsageMetadata } from './types';

export const GEMINI_MODEL = 'gemini-3.8-flash';

export const GEMINI_MODELS_CHAIN = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
] as const;

export type AllowedGeminiModelId = (typeof GEMINI_MODELS_CHAIN)[number]['id'];

export function getModelLabel(modelId: string): string {
  const found = GEMINI_MODELS_CHAIN.find((m) => m.id === modelId);
  return found ? found.label : modelId;
}

export const FACT_PRESERVATION_RULES = `
STRICT FACT-PRESERVATION RULES:
1. Preserve the user's exact roles, companies, tools, degrees, and stated accomplishments.
2. NEVER invent experience, qualifications, companies, or fabricated metrics/numbers not present in the input.
3. If the input contains numbers, keep them accurate; if not, strengthen verbs and clarity without inventing numbers.
`.trim();

export function getServerGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables.'
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
  const serverMax =
    Number.isFinite(envDefault) && envDefault > 0 ? envDefault : 50;

  const customHeader = req.headers.get('x-ai-custom-limit');
  if (customHeader) {
    const parsedCustom = parseInt(customHeader, 10);
    if (
      Number.isFinite(parsedCustom) &&
      parsedCustom >= 1 &&
      parsedCustom <= 500
    ) {
      return parsedCustom;
    }
  }
  return serverMax;
}

function getWindowMs(): number {
  const envMinutes = parseInt(process.env.AI_RATE_WINDOW_MINUTES || '60', 10);
  const minutes =
    Number.isFinite(envMinutes) && envMinutes > 0 ? envMinutes : 60;
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

  if (bucket.used >= limit) {
    const previousModel =
      GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
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

  const currentModel =
    GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];

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

  if (bucket.used >= limit) {
    const previousModel =
      GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
    const nextIndex = (bucket.modelIndex + 1) % GEMINI_MODELS_CHAIN.length;
    bucket = {
      used: 0,
      resetAtMs: now + windowMs,
      modelIndex: nextIndex,
      switchedFromModel: previousModel.label,
    };
    quotaStore.set(clientId, bucket);
  }

  const currentModel =
    GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];

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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Model request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Calls Gemini generateContent with low-latency thinking configuration and fast automatic model failover.
 * - Uses ThinkingLevel.LOW on gemini-3.8-flash to cut response time from ~8s down to ~1.5s.
 * - Enforces a per-attempt timeout so serverless functions on Vercel never hang or trigger 504 "Failed to fetch".
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

    // Configure ThinkingLevel.LOW for gemini-3.8-flash to minimize latency;
    // gemini-3.1-flash-lite already defaults to MINIMAL (zero thinking latency).
    const modelConfig =
      candidateModel.id === 'gemini-3.8-flash'
        ? {
            ...params.config,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          }
        : params.config;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          ...params,
          model: candidateModel.id,
          config: modelConfig,
        }),
        7000
      );

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
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All Gemini models in the fallback chain are temporarily busy.');
}

export function cleanValidatedString(val: unknown, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  return val.trim();
}
