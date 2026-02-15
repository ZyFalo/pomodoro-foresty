import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { updateSettingsSchema } from '@/lib/utils/validation';

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

    await connectDB();

    // Build update object for settings subdocument
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) {
        update[`settings.${key}`] = value;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: update },
      { new: true }
    ).select('settings');

    return Response.json({ settings: updatedUser?.settings });
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
