import { ActivityLog } from '@/lib/db/models';
import type { EventType } from '@/types';

export async function logActivity(params: {
  user_id: string;
  event_type: EventType;
  detail: string;
  ip_address?: string;
}): Promise<void> {
  try {
    await ActivityLog.create({
      user_id: params.user_id,
      event_type: params.event_type,
      detail: params.detail,
      ip_address: params.ip_address ?? '',
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
