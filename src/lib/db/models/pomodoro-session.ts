import { Schema, model, models, type Document } from 'mongoose';

export interface IPomodoroSessionDocument extends Document {
  user_id: Schema.Types.ObjectId;
  duration: number;
  started_at: Date;
  completed_at?: Date;
  tree_earned_id?: Schema.Types.ObjectId;
  status: 'active' | 'completed' | 'abandoned';
}

const pomodoroSessionSchema = new Schema<IPomodoroSessionDocument>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  duration: { type: Number, required: true },
  started_at: { type: Date, default: Date.now },
  completed_at: { type: Date },
  tree_earned_id: { type: Schema.Types.ObjectId, ref: 'UserTree' },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
});

export const PomodoroSession = models.PomodoroSession || model<IPomodoroSessionDocument>('PomodoroSession', pomodoroSessionSchema);
