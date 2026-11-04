import { NextRequest, NextResponse } from 'next/server';
import { checkAuthRateLimit, recordAuthAttempt } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : 'check';
    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase().slice(0, 254)
        : '';
    const success = Boolean(body.success);

    if (action === 'record') {
      const result = recordAuthAttempt(req, email, success);
      return NextResponse.json(result, {
        status: result.allowed ? 200 : 429,
      });
    }

    const result = checkAuthRateLimit(req, email);
    return NextResponse.json(result, {
      status: result.allowed ? 200 : 429,
    });
  } catch {
    return NextResponse.json(
      {
        allowed: true,
        remainingAttempts: 6,
        retryAfterSeconds: 0,
      },
      { status: 200 }
    );
  }
}
