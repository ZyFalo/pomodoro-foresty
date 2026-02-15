// User settings
export interface IUserSettings {
  pomodoro_duration: number; // default 25
  break_duration: number; // default 5
  sessions_per_cycle: number; // default 4
  ambient_sound: boolean; // default true
  notifications: boolean; // default true
  auto_start_break: boolean; // default false
}

// User document
export interface IUser {
  _id: string;
  username: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  verification_code?: string;
  verification_expires?: Date;
  reset_code?: string;
  reset_expires?: Date;
  role: 'user' | 'admin';
  settings: IUserSettings;
  pomodoros_completed: number;
  total_focus_minutes: number;
  total_trees: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tree template
export interface ITemplate {
  _id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  probability: number; // 1-25
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// User tree (collected)
export interface IUserTree {
  _id: string;
  user_id: string;
  template_id: string | ITemplate; // can be populated
  custom_name?: string;
  is_favorite: boolean;
  earned_at: Date;
}

// Pomodoro session
export interface IPomodoroSession {
  _id: string;
  user_id: string;
  duration: number; // minutes
  started_at: Date;
  completed_at?: Date;
  tree_earned_id?: string;
  status: 'active' | 'completed' | 'abandoned';
}

// Activity log
export type EventType = 'login' | 'registro' | 'pomodoro_completado' | 'arbol_ganado' | 'template_creado' | 'template_editado' | 'template_eliminado' | 'usuario_desactivado' | 'contrasena_cambiada';

export interface IActivityLog {
  _id: string;
  user_id: string;
  event_type: EventType;
  detail: string;
  ip_address: string;
  created_at: Date;
}

// Phrase cache
export interface IPhraseCache {
  _id: string;
  phrases: string[];
  fetched_at: Date;
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
  tree: IUserTree;
  template: ITemplate;
  stats: {
    pomodoros_completed: number;
    total_focus_minutes: number;
    total_trees: number;
  };
}
