import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db/prisma';
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
  const cached = await prisma.phraseCache.findFirst({
    orderBy: { fetchedAt: 'desc' },
  });

  if (cached && cached.phrases.length > 0) {
    if (isToday(cached.fetchedAt)) {
      return cached.phrases;
    }

    const fresh = await scrapePhrases();
    if (fresh.length > 0) {
      await prisma.phraseCache.update({
        where: { id: cached.id },
        data: { phrases: fresh, fetchedAt: new Date() },
      });
      return fresh;
    }

    return cached.phrases;
  }

  const fresh = await scrapePhrases();
  if (fresh.length > 0) {
    await prisma.phraseCache.create({
      data: { phrases: fresh },
    });
    return fresh;
  }

  return [DEFAULT_PHRASE];
}

export async function getRandomPhrase(): Promise<string> {
  try {
    const phrases = await getCachedPhrases();

    let available = phrases.filter((p) => !recentPhrases.includes(p));

    if (available.length === 0) {
      if (recentPhrases.length > 0) recentPhrases.shift();
      available = phrases.filter((p) => !recentPhrases.includes(p));
    }

    if (available.length === 0) return DEFAULT_PHRASE;

    const phrase = available[Math.floor(Math.random() * available.length)];

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
