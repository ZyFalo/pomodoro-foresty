import { prisma } from '@/lib/db/prisma';
import type { LogActivityParams } from '@/types';

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.user_id,
        eventType: params.event_type,
        detail: params.detail,
        ipAddress: params.ip_address ?? '',
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
