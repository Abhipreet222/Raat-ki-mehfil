import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Validate slug (prevent directory traversal)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid playlist slug' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'content', slug, 'playlist.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const playlist = JSON.parse(fileContents);
    
    return NextResponse.json(playlist, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`Error reading playlist:`, error);
    return NextResponse.json({ error: 'Failed to load playlist' }, { status: 500 });
  }
}
