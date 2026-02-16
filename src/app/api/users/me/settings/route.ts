import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { updateSettingsSchema } from '@/lib/utils/validation';
import { extractSettings } from '@/types';

// Map from settings keys (snake_case API) to Prisma field names (camelCase)
const settingsFieldMap: Record<string, string> = {
  pomodoro_duration: 'pomodoroDuration',
  break_duration: 'breakDuration',
  sessions_per_cycle: 'sessionsPerCycle',
  ambient_sound: 'ambientSound',
  notifications: 'notifications',
  auto_start_break: 'autoStartBreak',
  long_break_duration: 'longBreakDuration',
};

// PUT /api/users/me/settings
export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Build update object mapping snake_case keys to camelCase Prisma fields
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) {
        const prismaField = settingsFieldMap[key] ?? key;
        update[prismaField] = value;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: update,
    });

    return Response.json({ settings: extractSettings(updatedUser) });
  } catch (err) {
    console.error('[PUT /api/users/me/settings]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
