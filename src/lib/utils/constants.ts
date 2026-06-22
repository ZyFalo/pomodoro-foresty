// Rarity ranges based on probability value
export const RARITY_RANGES = [
  { min: 1, max: 2, name: 'Legendario' as const, color: '#FFD700', badgeBg: '#FEF3C7' },
  { min: 3, max: 5, name: 'Épico' as const, color: '#9333EA', badgeBg: '#EDE9FE' },
  { min: 6, max: 10, name: 'Raro' as const, color: '#3B82F6', badgeBg: '#DBEAFE' },
  { min: 11, max: 15, name: 'Poco común' as const, color: '#22C55E', badgeBg: '#D1FAE5' },
  { min: 16, max: 25, name: 'Común' as const, color: '#6B7280', badgeBg: '#F3F4F6' },
] as const;

// Pomodoro durations (minutes)
export const POMODORO_DURATIONS = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120] as const;
export const DEFAULT_POMODORO_DURATION = 25;
export const DEFAULT_BREAK_DURATION = 5;
export const DEFAULT_LONG_BREAK_DURATION = 15;
export const DEFAULT_SESSIONS_PER_CYCLE = 4;

// Minimum values for settings
export const MIN_BREAK_DURATION = 1;
export const MIN_LONG_BREAK_DURATION = 4;
export const MIN_SESSIONS_PER_CYCLE = 3;

// Duration bonus: extra trees for longer pomodoros. Every 20 min above 5 gives +1 tree.
export function getDurationBonusTrees(durationMinutes: number): number {
  return Math.floor((durationMinutes - 5) / 20);
}

// Time validation: allow 90% of duration to account for network latency
export const TIME_VALIDATION_THRESHOLD = 0.9;

// Minimum elapsed milliseconds required to complete a pomodoro of the given duration.
export function getRequiredElapsedMs(durationMinutes: number): number {
  return durationMinutes * 60 * 1000 * TIME_VALIDATION_THRESHOLD;
}

// Trees awarded for completing a session: 1 base tree (or sessionsPerCycle - 1 when the
// session closes a cycle) plus the duration bonus.
export function getSessionReward(
  sessionNumber: number | undefined,
  sessionsPerCycle: number | undefined,
  durationMinutes: number
): { isCycleComplete: boolean; baseTrees: number; durationBonus: number; treeCount: number } {
  const durationBonus = getDurationBonusTrees(durationMinutes);
  if (
    typeof sessionNumber === 'number' &&
    typeof sessionsPerCycle === 'number' &&
    sessionNumber === sessionsPerCycle
  ) {
    const baseTrees = sessionsPerCycle - 1;
    return { isCycleComplete: true, baseTrees, durationBonus, treeCount: baseTrees + durationBonus };
  }
  return { isCycleComplete: false, baseTrees: 1, durationBonus, treeCount: 1 + durationBonus };
}

// Verification code
export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
export const RESET_CODE_EXPIRY_MINUTES = 15;

// JWT
export const JWT_EXPIRY = '7d';

// Phrases
export const DEFAULT_PHRASE = '¡Cada minuto cuenta en tu camino hacia el éxito!';
export const PHRASE_BUFFER_SIZE = 5;
export const PHRASES_SOURCE_URL = 'https://www.shopify.com/es/blog/frases-de-motivacion';

// Audio
export const AUDIO_FALLBACK_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-loop-542.mp3';
export const TREE_FM_ID_RANGE = { min: 40, max: 65 } as const;
export const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  pomodoro_duration: DEFAULT_POMODORO_DURATION,
  break_duration: DEFAULT_BREAK_DURATION,
  sessions_per_cycle: DEFAULT_SESSIONS_PER_CYCLE,
  ambient_sound: true,
  notifications: true,
  auto_start_break: false,
  long_break_duration: DEFAULT_LONG_BREAK_DURATION,
} as const;

// Tree categories
export const TREE_CATEGORIES = [
  'Tropical', 'Templado', 'Conífero', 'Frutal', 'Exótico', 'Fantástico',
] as const;
