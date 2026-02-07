import { NextResponse } from 'next/server';

/**
 * App store download counts. Set in .env:
 * APPLE_DOWNLOADS=301
 * GOOGLE_PLAY_DOWNLOADS=0
 * Update these from App Store Connect and Google Play Console.
 */
export async function GET() {
  const apple = process.env.APPLE_DOWNLOADS ? parseInt(process.env.APPLE_DOWNLOADS, 10) : null;
  const google = process.env.GOOGLE_PLAY_DOWNLOADS ? parseInt(process.env.GOOGLE_PLAY_DOWNLOADS, 10) : null;
  const data = {
    apple_downloads: Number.isNaN(apple) ? null : apple,
    google_play_downloads: Number.isNaN(google) ? null : google,
    total_downloads: [apple, google].filter((n): n is number => typeof n === 'number' && !Number.isNaN(n)).reduce((a, b) => a + b, 0),
  };
  return NextResponse.json({ data });
}
