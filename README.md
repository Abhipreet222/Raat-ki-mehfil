# Raat Ki Mehfil

A minimalist single-page ambient music website — a quiet digital room where one song plays at a time on loop. 
"ek raat, ek mehfil, ek gaana"

## Features

- **Auto-playing Audio Player**: Plays through a curated playlist with a fallback to "tap to play" if blocked by the browser.
- **Live Listener Count**: See how many "souls" are currently listening (simple polling backend).
- **Now Playing Card**: Elegant display of the current track, artist, cover art, and a visual progress bar.
- **Responsive & Dark Theme**: Built mobile-first with a deep night aesthetic (indigo, amber, and gold).
- **Security Headers**: Standard Next.js headers (CSP, X-Frame-Options, X-Content-Type-Options) are configured out of the box.
- **Open Graph Ready**: Supports rich social media link previews.

## Tech Stack

- Frontend & API: **Next.js (App Router)**
- Styling: **Tailwind CSS v4**
- Icons: **Lucide React**
- Language: **TypeScript**

## Setup & Local Development

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the site.

## Configuration & Content

- **Playlist**: Edit `content/playlist.json` in the root of the project to add your own tracks. The file structure is an array of track objects containing `id`, `title`, `artist`, `coverUrl`, and `audioUrl`.
- **Background**: Replace `public/bg.png` with your desired high-quality night-themed background image.
- **Environment Variables**: Use `.env.example` as a template for any future backend secrets (like Redis URLs for real-time listener counts).

## Deployment

The project is optimized for deployment to **Vercel**:
1. Connect your repository to Vercel.
2. The framework preset will automatically detect Next.js.
3. Deploy! (No additional secrets are required for the MVP).
