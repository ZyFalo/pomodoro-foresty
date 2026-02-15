import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { PomodoroSession } from '@/lib/db/models';
import { getRandomPhrase } from '@/lib/scrapers/phrases';
import { getForestAudioUrl } from '@/lib/scrapers/audio';
import { POMODORO_DURATIONS } from '@/lib/utils/constants';

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedDuration = body.duration ?? user.settings.pomodoro_duration;

    if (!POMODORO_DURATIONS.includes(requestedDuration)) {
      return Response.json({ error: 'Duración no válida' }, { status: 400 });
    }

    if (!user.email_verified) {
      return Response.json({ error: 'Debes verificar tu email primero' }, { status: 403 });
    }

    await connectDB();

    // Abandon any active sessions
    await PomodoroSession.updateMany(
      { user_id: user._id, status: 'active' },
      { status: 'abandoned' }
    );

    // Create new session
    const session = await PomodoroSession.create({
      user_id: user._id,
      duration: requestedDuration,
      started_at: new Date(),
    });

    // Fetch phrase and audio in parallel
    const [phrase, audio_url] = await Promise.all([
      getRandomPhrase(),
      getForestAudioUrl(),
    ]);

    return Response.json({
      session_id: session._id.toString(),
      duration: requestedDuration,
      phrase,
      audio_url,
    });
  } catch (error) {
    console.error('Error starting pomodoro:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
