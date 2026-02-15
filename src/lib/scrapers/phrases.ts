import * as cheerio from 'cheerio';
import { connectDB } from '@/lib/db/connection';
import { PhraseCache } from '@/lib/db/models';
import {
  DEFAULT_PHRASE,
  PHRASE_BUFFER_SIZE,
  PHRASES_SOURCE_URL,
} from '@/lib/utils/constants';

// Buffer circular for anti-repetition (server-level)
const recentPhrases: string[] = [];

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

async function scrapePhrases(): Promise<string[]> {
  try {
    const response = await fetch(PHRASES_SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strategy 1: <ol li> inside <article>, filter phrases > 15 chars
    let phrases: string[] = [];
    $('article ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 15) phrases.push(text);
    });

    if (phrases.length >= 5) return phrases;

    // Strategy 2: <p> containing quotes
    phrases = [];
    $('article p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes('"') || text.includes('\u201C') || text.includes('\u00AB')) {
        if (text.length > 15 && text.length < 300) {
          phrases.push(text);
        }
      }
    });

    if (phrases.length >= 5) return phrases;

    // Strategy 3: <ol li> in whole document, 20-300 chars
    phrases = [];
    $('ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length >= 20 && text.length <= 300) {
        phrases.push(text);
      }
    });

    return phrases.length > 0 ? phrases : [DEFAULT_PHRASE];
  } catch (error) {
    console.error('Error scraping phrases:', error);
    return [];
  }
}

async function getCachedPhrases(): Promise<string[]> {
  await connectDB();

  // Try to get cached phrases
  const cached = await PhraseCache.findOne().sort({ fetched_at: -1 });

  if (cached && cached.phrases.length > 0) {
    // If cache is from today, use it
    if (isToday(cached.fetched_at)) {
      return cached.phrases;
    }

    // Try to scrape fresh ones
    const fresh = await scrapePhrases();
    if (fresh.length > 0) {
      // Update cache
      cached.phrases = fresh;
      cached.fetched_at = new Date();
      await cached.save();
      return fresh;
    }

    // If scraping failed, use stale cache
    return cached.phrases;
  }

  // No cache at all, scrape
  const fresh = await scrapePhrases();
  if (fresh.length > 0) {
    await PhraseCache.create({ phrases: fresh, fetched_at: new Date() });
    return fresh;
  }

  return [DEFAULT_PHRASE];
}

export async function getRandomPhrase(): Promise<string> {
  try {
    const phrases = await getCachedPhrases();

    // Filter out recent phrases
    let available = phrases.filter((p) => !recentPhrases.includes(p));

    // If all phrases are in buffer, remove oldest
    if (available.length === 0) {
      if (recentPhrases.length > 0) recentPhrases.shift();
      available = phrases.filter((p) => !recentPhrases.includes(p));
    }

    // Still empty? Return default
    if (available.length === 0) return DEFAULT_PHRASE;

    // Pick random
    const phrase = available[Math.floor(Math.random() * available.length)];

    // Add to buffer
    recentPhrases.push(phrase);
    if (recentPhrases.length > PHRASE_BUFFER_SIZE) {
      recentPhrases.shift();
    }

    return phrase;
  } catch (error) {
    console.error('Error getting phrase:', error);
    return DEFAULT_PHRASE;
  }
}
