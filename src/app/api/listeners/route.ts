import { NextResponse } from 'next/server';
import { recordListenerActivity, getActiveListenersCount } from '@/lib/store';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Prefer client-supplied UUID (generated once per browser in localStorage).
    // This is reliable in both local dev and serverless where x-forwarded-for
    // is absent, which previously caused everyone to hash to the same key.
    const clientId = searchParams.get('id');

    let listenerId: string;
    if (clientId && clientId.length > 0) {
      // Hash the client ID to avoid storing raw UUIDs
      listenerId = crypto.createHash('sha256').update(clientId).digest('hex');
    } else {
      // Fallback: try IP, then generate a random key so we never error out
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : crypto.randomUUID();
      listenerId = crypto.createHash('sha256').update(ip).digest('hex');
    }

    // Record activity
    recordListenerActivity(listenerId);

    // Get current count
    const count = getActiveListenersCount();

    return NextResponse.json({ count }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error tracking listener:', error);
    return NextResponse.json({ count: 1 }, { status: 500 }); // Fallback to 1
  }
}
