import {
  GoogleGenAI,
  GenerateContentParameters,
  GenerateContentResponse,
  ThinkingLevel,
} from '@google/genai';
import { NextRequest } from 'next/server';
import { AiUsageMetadata } from './types';
import { verifyFirebaseIdToken, getClientIp } from './server-auth';

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
  burstCount: number;
  burstResetAtMs: number;
}

const quotaStore = new Map<string, QuotaBucket>();
const MAX_BURST_PER_MINUTE = 15; // Anti-spam & automated abuse rate limit per minute

function getClientIdentifier(req: NextRequest, verifiedUid?: string): string {
  if (verifiedUid) {
    return `uid:${verifiedUid}`;
  }
  const sessionHeader = req.headers.get('x-ai-session-id');
  if (sessionHeader && sessionHeader.trim()) {
    return `session:${sessionHeader.trim().slice(0, 64)}`;
  }
  return `ip:${getClientIp(req)}`;
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

/**
 * Verifies the Firebase Authentication ID token AND enforces per-user + per-minute rate limiting
 * on protected AI server endpoints.
 */
export async function verifyAndConsumeAiQuota(req: NextRequest): Promise<{
  allowed: boolean;
  statusCode: number;
  usage: AiUsageMetadata;
  uid?: string;
  errorMessage?: string;
}> {
  // 1. Reject oversized payloads (>150KB) to protect against DoS / abuse
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > 150_000) {
    return {
      allowed: false,
      statusCode: 413,
      usage: getAiQuotaStatus(req),
      errorMessage: 'Request payload is too large. Maximum allowed size is 150KB.',
    };
  }

  // 2. Cryptographically verify Firebase Auth ID Token on the server
  const tokenCheck = await verifyFirebaseIdToken(req);
  if (!tokenCheck.verified || !tokenCheck.user) {
    return {
      allowed: false,
      statusCode: tokenCheck.statusCode || 401,
      usage: getAiQuotaStatus(req),
      errorMessage:
        tokenCheck.errorMessage ||
        'Authentication required. Please sign in to use AI features.',
    };
  }

  const verifiedUid = tokenCheck.user.uid;
  const quota = checkAndConsumeAiQuota(req, verifiedUid);
  return {
    allowed: quota.allowed,
    statusCode: quota.allowed ? 200 : 429,
    usage: quota.usage,
    uid: verifiedUid,
    errorMessage: quota.errorMessage,
  };
}

export function checkAndConsumeAiQuota(
  req: NextRequest,
  verifiedUid?: string
): {
  allowed: boolean;
  usage: AiUsageMetadata;
  errorMessage?: string;
} {
  const clientId = getClientIdentifier(req, verifiedUid);
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
      burstCount: 0,
      burstResetAtMs: now + 60_000,
    };
  }

  if (now >= bucket.burstResetAtMs) {
    bucket.burstCount = 0;
    bucket.burstResetAtMs = now + 60_000;
  }

  bucket.burstCount += 1;
  if (bucket.burstCount > MAX_BURST_PER_MINUTE) {
    quotaStore.set(clientId, bucket);
    const currentModel =
      GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
    return {
      allowed: false,
      errorMessage:
        'Rate limit reached: Too many AI requests in one minute. Please wait a few seconds before trying again.',
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

  if (bucket.used >= limit) {
    const previousModel =
      GEMINI_MODELS_CHAIN[bucket.modelIndex] || GEMINI_MODELS_CHAIN[0];
    const nextIndex = (bucket.modelIndex + 1) % GEMINI_MODELS_CHAIN.length;
    bucket = {
      used: 0,
      resetAtMs: now + windowMs,
      modelIndex: nextIndex,
      switchedFromModel: previousModel.label,
      burstCount: bucket.burstCount,
      burstResetAtMs: bucket.burstResetAtMs,
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

export function getAiQuotaStatus(
  req: NextRequest,
  verifiedUid?: string
): AiUsageMetadata {
  const clientId = getClientIdentifier(req, verifiedUid);
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
      burstCount: 0,
      burstResetAtMs: now + 60_000,
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
    burstCount: 1,
    burstResetAtMs: now + 60_000,
  };

  const startIndex = bucket.modelIndex % GEMINI_MODELS_CHAIN.length;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < GEMINI_MODELS_CHAIN.length; attempt++) {
    const candidateIndex = (startIndex + attempt) % GEMINI_MODELS_CHAIN.length;
    const candidateModel = GEMINI_MODELS_CHAIN[candidateIndex];

    const modelConfig =
      candidateModel.id === 'gemini-3.8-flash'
        ? {
            ...params.config,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          }
        : params.config;

    try {
      let response: GenerateContentResponse;
      try {
        response = await withTimeout(
          ai.models.generateContent({
            ...params,
            model: candidateModel.id,
            config: modelConfig,
          }),
          9000
        );
      } catch (innerErr: unknown) {
        if (candidateModel.id === 'gemini-3.8-flash') {
          response = await withTimeout(
            ai.models.generateContent({
              ...params,
              model: candidateModel.id,
              config: params.config,
            }),
            9000
          );
        } else {
          throw innerErr;
        }
      }

      if (attempt > 0) {
        const prevModel = GEMINI_MODELS_CHAIN[startIndex];
        bucket = {
          used: 1,
          resetAtMs: now + windowMs,
          modelIndex: candidateIndex,
          switchedFromModel: prevModel.label,
          burstCount: bucket.burstCount,
          burstResetAtMs: bucket.burstResetAtMs,
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

/**
 * Validates and sanitizes untrusted user text inputs against control characters,
 * script tags, and oversized strings.
 */
export function cleanValidatedString(
  val: unknown,
  fallback = '',
  maxLength = 4000
): string {
  if (typeof val !== 'string') return fallback;
  const sanitized = val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<\s*\/?\s*script[^>]*>/gi, '')
    .trim();
  return sanitized.slice(0, maxLength) || fallback;
}
