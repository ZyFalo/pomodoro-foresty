import { AUDIO_FALLBACK_URL, TREE_FM_ID_RANGE } from '@/lib/utils/constants';

export async function getForestAudioUrl(): Promise<string> {
  try {
    const id = Math.floor(
      Math.random() * (TREE_FM_ID_RANGE.max - TREE_FM_ID_RANGE.min + 1) + TREE_FM_ID_RANGE.min
    );

    const response = await fetch(`https://www.tree.fm/forest/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();

    // Primary: look for <audio><source src="...mp3">
    const audioSourceMatch = html.match(/<audio[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+\.mp3)["']/i);
    if (audioSourceMatch?.[1]) return audioSourceMatch[1];

    // Fallback: look for any <source src="...mp3">
    const sourceMatch = html.match(/<source[^>]+src=["']([^"']+\.mp3)["']/i);
    if (sourceMatch?.[1]) return sourceMatch[1];

    // No match found
    throw new Error('No MP3 URL found in HTML');
  } catch (error) {
    console.error('Error scraping audio from tree.fm:', error);
    return AUDIO_FALLBACK_URL;
  }
}
