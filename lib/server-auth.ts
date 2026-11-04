import crypto from 'crypto';
import { NextRequest } from 'next/server';
import firebaseConfig from '../firebase-applet-config.json';

const FIREBASE_PROJECT_ID = firebaseConfig.projectId || 'vitaeflow-ada2d';
const EXPECTED_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface VerifiedFirebaseToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  signInProvider?: string;
  exp: number;
  iat: number;
}

interface CertCache {
  certs: Record<string, string>;
  expiresAtMs: number;
}

let certCache: CertCache | null = null;

async function getGooglePublicCerts(
  forceRefresh = false
): Promise<Record<string, string>> {
  const now = Date.now();
  if (!forceRefresh && certCache && now < certCache.expiresAtMs) {
    return certCache.certs;
  }

  const res = await fetch(GOOGLE_CERTS_URL, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google SecureToken public certificates (${res.status})`);
  }

  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

  const certs = (await res.json()) as Record<string, string>;
  certCache = {
    certs,
    expiresAtMs: now + Math.max(300, maxAgeSeconds) * 1000,
  };
  return certs;
}

function decodeBase64UrlJson<T>(segment: string): T {
  const jsonStr = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(jsonStr) as T;
}

/**
 * Cryptographically verifies a Firebase Authentication ID token on the server.
 * Never trusts client-side claims without signature & issuer/audience verification.
 */
export async function verifyFirebaseIdToken(
  req: NextRequest
): Promise<{
  verified: boolean;
  user?: VerifiedFirebaseToken;
  statusCode: number;
  errorCode?: 'AUTH_REQUIRED' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN';
  errorMessage?: string;
}> {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'AUTH_REQUIRED',
      errorMessage:
        'Authentication required. Please sign in to access protected AI features.',
    };
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Malformed authentication token.',
    };
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Invalid JWT token structure.',
    };
  }

  const [headerSeg, payloadSeg, signatureSeg] = parts;

  let header: { alg?: string; kid?: string };
  let payload: {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
    firebase?: { sign_in_provider?: string };
  };

  try {
    header = decodeBase64UrlJson(headerSeg);
    payload = decodeBase64UrlJson(payloadSeg);
  } catch {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Unable to decode authentication token.',
    };
  }

  if (header.alg !== 'RS256' || !header.kid) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Unsupported token signature algorithm.',
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSeconds - 30) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'TOKEN_EXPIRED',
      errorMessage:
        'Your authentication session has expired. Please refresh or sign in again.',
    };
  }

  if (!payload.iat || payload.iat > nowSeconds + 300) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Invalid token issue timestamp.',
    };
  }

  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== EXPECTED_ISSUER) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Token project audience or issuer mismatch.',
    };
  }

  if (
    !payload.sub ||
    typeof payload.sub !== 'string' ||
    payload.sub.length < 1 ||
    payload.sub.length > 128 ||
    !/^[a-zA-Z0-9_\-]+$/.test(payload.sub)
  ) {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Invalid subject UID in token.',
    };
  }

  // Verify RS256 cryptographic signature against Google's public X.509 certs
  try {
    let certs = await getGooglePublicCerts(false);
    let certPem = certs[header.kid];
    if (!certPem) {
      certs = await getGooglePublicCerts(true);
      certPem = certs[header.kid];
    }
    if (!certPem) {
      return {
        verified: false,
        statusCode: 401,
        errorCode: 'INVALID_TOKEN',
        errorMessage: 'Signing key not found in Google SecureToken certificates.',
      };
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerSeg}.${payloadSeg}`);
    verifier.end();
    const signatureValid = verifier.verify(
      certPem,
      Buffer.from(signatureSeg, 'base64url')
    );

    if (!signatureValid) {
      return {
        verified: false,
        statusCode: 401,
        errorCode: 'INVALID_TOKEN',
        errorMessage: 'Invalid authentication token signature.',
      };
    }
  } catch {
    return {
      verified: false,
      statusCode: 401,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'Failed to verify authentication token signature.',
    };
  }

  return {
    verified: true,
    statusCode: 200,
    user: {
      uid: payload.sub,
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      signInProvider: payload.firebase?.sign_in_provider,
      exp: payload.exp,
      iat: payload.iat,
    },
  };
}

// ============================================================================
// Server-Side Login & Sensitive Endpoint Rate Limiter
// ============================================================================
interface AuthRateBucket {
  attempts: number;
  windowResetAtMs: number;
  lockedUntilMs: number;
}

const authRateStore = new Map<string, AuthRateBucket>();
const MAX_AUTH_ATTEMPTS_PER_WINDOW = 6;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout on excessive failures

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return 'local-ip';
}

export function checkAuthRateLimit(
  req: NextRequest,
  identifier = ''
): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
  errorMessage?: string;
} {
  const ip = getClientIp(req);
  const safeId = identifier.trim().toLowerCase().slice(0, 128);
  const key = `auth:${ip}:${safeId}`;
  const now = Date.now();

  const bucket = authRateStore.get(key);
  if (!bucket || now >= bucket.windowResetAtMs) {
    return {
      allowed: true,
      remainingAttempts: MAX_AUTH_ATTEMPTS_PER_WINDOW,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.lockedUntilMs > now) {
    const retryAfterSeconds = Math.ceil((bucket.lockedUntilMs - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      errorMessage: `Too many authentication attempts. Please wait ${retryAfterSeconds} seconds before trying again.`,
    };
  }

  const remaining = Math.max(0, MAX_AUTH_ATTEMPTS_PER_WINDOW - bucket.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
    retryAfterSeconds: 0,
  };
}

export function recordAuthAttempt(
  req: NextRequest,
  identifier = '',
  success = false
): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
  errorMessage?: string;
} {
  const ip = getClientIp(req);
  const safeId = identifier.trim().toLowerCase().slice(0, 128);
  const key = `auth:${ip}:${safeId}`;
  const now = Date.now();

  if (success) {
    authRateStore.delete(key);
    return {
      allowed: true,
      remainingAttempts: MAX_AUTH_ATTEMPTS_PER_WINDOW,
      retryAfterSeconds: 0,
    };
  }

  let bucket = authRateStore.get(key);
  if (!bucket || now >= bucket.windowResetAtMs) {
    bucket = {
      attempts: 0,
      windowResetAtMs: now + AUTH_WINDOW_MS,
      lockedUntilMs: 0,
    };
  }

  bucket.attempts += 1;
  if (bucket.attempts >= MAX_AUTH_ATTEMPTS_PER_WINDOW) {
    bucket.lockedUntilMs = now + LOCKOUT_DURATION_MS;
  }
  authRateStore.set(key, bucket);

  if (bucket.lockedUntilMs > now) {
    const retryAfterSeconds = Math.ceil((bucket.lockedUntilMs - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      errorMessage: `Too many failed sign-in attempts. Account login temporarily rate-limited for ${retryAfterSeconds} seconds.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(
      0,
      MAX_AUTH_ATTEMPTS_PER_WINDOW - bucket.attempts
    ),
    retryAfterSeconds: 0,
  };
}
