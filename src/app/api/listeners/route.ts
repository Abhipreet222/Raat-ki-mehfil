import { NextResponse } from 'next/server';
import { recordListenerActivity, getActiveListenersCount } from '@/lib/store';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    // Get IP address (handles Vercel's x-forwarded-for)
    const forwardedFor = request.headers.get('x-forwarded-for');
    let ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Hash IP for privacy (do not store raw PII)
    const hashedId = crypto.createHash('sha256').update(ip).digest('hex');
    
    // Record activity
    recordListenerActivity(hashedId);
    
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
