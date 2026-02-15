import { Schema, model, models, type Document } from 'mongoose';

export interface ITemplateDocument extends Document {
  name: string;
  category: string;
  description: string;
  image_url: string;
  probability: number;
  is_active: boolean;
  created_by: Schema.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const templateSchema = new Schema<ITemplateDocument>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image_url: { type: String, required: true },
  probability: { type: Number, required: true, min: 1, max: 25 },
  is_active: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Template = models.Template || model<ITemplateDocument>('Template', templateSchema);
