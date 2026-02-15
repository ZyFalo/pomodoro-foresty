import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { getRandomPhrase } from '@/lib/scrapers/phrases';
import { getForestAudioUrl } from '@/lib/scrapers/audio';
import { POMODORO_DURATIONS } from '@/lib/utils/constants';

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedDuration = body.duration ?? user.pomodoroDuration;

    if (!POMODORO_DURATIONS.includes(requestedDuration)) {
      return Response.json({ error: 'Duración no válida' }, { status: 400 });
    }

    if (!user.emailVerified) {
      return Response.json({ error: 'Debes verificar tu email primero' }, { status: 403 });
    }

    // Abandon any active sessions
    await prisma.pomodoroSession.updateMany({
      where: { userId: user.id, status: 'active' },
      data: { status: 'abandoned' },
    });

    // Create new session
    const session = await prisma.pomodoroSession.create({
      data: {
        userId: user.id,
        duration: requestedDuration,
      },
    });

    // Fetch phrase and audio in parallel
    const [phrase, audio_url] = await Promise.all([
      getRandomPhrase(),
      getForestAudioUrl(),
    ]);

    return Response.json({
      session_id: session.id,
      duration: requestedDuration,
      phrase,
      audio_url,
    });
  } catch (error) {
    console.error('Error starting pomodoro:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
