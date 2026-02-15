import type { User, Template, UserTree, PomodoroSession, ActivityLog, EventType as PrismaEventType } from '@/generated/prisma/client';

// Re-export Prisma types for convenience
export type { User, Template, UserTree, PomodoroSession, ActivityLog, PhraseCache } from '@/generated/prisma/client';
export type { UserRole, SessionStatus, EventType } from '@/generated/prisma/client';

// User settings (flattened in DB, grouped for API responses)
export interface IUserSettings {
  pomodoro_duration: number;
  break_duration: number;
  sessions_per_cycle: number;
  ambient_sound: boolean;
  notifications: boolean;
  auto_start_break: boolean;
}

// Extract settings object from flat User columns
export function extractSettings(user: User): IUserSettings {
  return {
    pomodoro_duration: user.pomodoroDuration,
    break_duration: user.breakDuration,
    sessions_per_cycle: user.sessionsPerCycle,
    ambient_sound: user.ambientSound,
    notifications: user.notifications,
    auto_start_break: user.autoStartBreak,
  };
}

// Rarity type
export type Rarity = 'Común' | 'Poco común' | 'Raro' | 'Épico' | 'Legendario';

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// Auth responses
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    email_verified: boolean;
    settings: IUserSettings;
  };
}

// Pomodoro start response
export interface PomodoroStartResponse {
  session_id: string;
  duration: number;
  phrase: string;
  audio_url: string;
}

// Pomodoro complete response
export interface PomodoroCompleteResponse {
  tree: UserTree;
  template: Template;
  stats: {
    pomodoros_completed: number;
    total_focus_minutes: number;
    total_trees: number;
  };
}

// Activity log params (for logActivity service)
export interface LogActivityParams {
  user_id: string;
  event_type: PrismaEventType;
  detail: string;
  ip_address?: string;
}
