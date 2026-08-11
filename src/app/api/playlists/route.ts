import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'playlists-index.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const playlists = JSON.parse(fileContents);
    
    // Add standard headers for security
    return NextResponse.json(playlists, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error reading playlists index:', error);
    return NextResponse.json({ error: 'Failed to load playlists' }, { status: 500 });
  }
}
