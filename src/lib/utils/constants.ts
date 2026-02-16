// Rarity ranges based on probability value
export const RARITY_RANGES = [
  { min: 1, max: 2, name: 'Legendario' as const, color: '#FFD700', badgeBg: '#FEF3C7' },
  { min: 3, max: 5, name: 'Épico' as const, color: '#9333EA', badgeBg: '#EDE9FE' },
  { min: 6, max: 10, name: 'Raro' as const, color: '#3B82F6', badgeBg: '#DBEAFE' },
  { min: 11, max: 15, name: 'Poco común' as const, color: '#22C55E', badgeBg: '#D1FAE5' },
  { min: 16, max: 25, name: 'Común' as const, color: '#6B7280', badgeBg: '#F3F4F6' },
] as const;

// Pomodoro durations (minutes)
export const POMODORO_DURATIONS = [0.17, 25, 30, 45, 60] as const;
export const DEFAULT_POMODORO_DURATION = 25;
export const DEFAULT_BREAK_DURATION = 5;
export const DEFAULT_SESSIONS_PER_CYCLE = 4;

// Cycle bonus: trees earned on final session
export const CYCLE_BONUS_TREE_COUNT = 3;

// Time validation: allow 90% of duration to account for network latency
export const TIME_VALIDATION_THRESHOLD = 0.9;

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

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  pomodoro_duration: DEFAULT_POMODORO_DURATION,
  break_duration: DEFAULT_BREAK_DURATION,
  sessions_per_cycle: DEFAULT_SESSIONS_PER_CYCLE,
  ambient_sound: true,
  notifications: true,
  auto_start_break: false,
} as const;

// Tree categories
export const TREE_CATEGORIES = [
  'Tropical', 'Templado', 'Conífero', 'Frutal', 'Exótico', 'Fantástico',
] as const;
