import { Schema, model, models, type Document } from 'mongoose';

const EVENT_TYPES = [
  'login', 'registro', 'pomodoro_completado', 'arbol_ganado',
  'template_creado', 'template_editado', 'template_eliminado',
  'usuario_desactivado', 'contrasena_cambiada',
] as const;

export interface IActivityLogDocument extends Document {
  user_id: Schema.Types.ObjectId;
  event_type: typeof EVENT_TYPES[number];
  detail: string;
  ip_address: string;
  created_at: Date;
}

const activityLogSchema = new Schema<IActivityLogDocument>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event_type: { type: String, enum: EVENT_TYPES, required: true, index: true },
  detail: { type: String, required: true },
  ip_address: { type: String, default: '' },
  created_at: { type: Date, default: Date.now, index: true },
});

export const ActivityLog = models.ActivityLog || model<IActivityLogDocument>('ActivityLog', activityLogSchema);
