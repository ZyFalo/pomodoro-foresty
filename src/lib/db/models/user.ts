import { Schema, model, models, type Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  verification_code?: string;
  verification_expires?: Date;
  reset_code?: string;
  reset_expires?: Date;
  role: 'user' | 'admin';
  settings: {
    pomodoro_duration: number;
    break_duration: number;
    sessions_per_cycle: number;
    ambient_sound: boolean;
    notifications: boolean;
    auto_start_break: boolean;
  };
  pomodoros_completed: number;
  total_focus_minutes: number;
  total_trees: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const settingsSchema = new Schema({
  pomodoro_duration: { type: Number, default: 25 },
  break_duration: { type: Number, default: 5 },
  sessions_per_cycle: { type: Number, default: 4 },
  ambient_sound: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  auto_start_break: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password_hash: { type: String, required: true },
  email_verified: { type: Boolean, default: false },
  verification_code: { type: String },
  verification_expires: { type: Date },
  reset_code: { type: String },
  reset_expires: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  settings: { type: settingsSchema, default: () => ({}) },
  pomodoros_completed: { type: Number, default: 0 },
  total_focus_minutes: { type: Number, default: 0 },
  total_trees: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = models.User || model<IUserDocument>('User', userSchema);
