import { Schema, model, models, type Document } from 'mongoose';

export interface IUserTreeDocument extends Document {
  user_id: Schema.Types.ObjectId;
  template_id: Schema.Types.ObjectId;
  custom_name?: string;
  is_favorite: boolean;
  earned_at: Date;
}

const userTreeSchema = new Schema<IUserTreeDocument>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  template_id: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  custom_name: { type: String, trim: true },
  is_favorite: { type: Boolean, default: false },
  earned_at: { type: Date, default: Date.now },
});

export const UserTree = models.UserTree || model<IUserTreeDocument>('UserTree', userTreeSchema);
