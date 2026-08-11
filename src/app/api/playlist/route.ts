import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'playlist.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const playlist = JSON.parse(fileContents);
    
    // Add standard headers for security
    return NextResponse.json(playlist, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error reading playlist:', error);
    return NextResponse.json({ error: 'Failed to load playlist' }, { status: 500 });
  }
}
