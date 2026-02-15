import { Schema, model, models, type Document } from 'mongoose';

export interface IPhraseCacheDocument extends Document {
  phrases: string[];
  fetched_at: Date;
}

const phraseCacheSchema = new Schema<IPhraseCacheDocument>({
  phrases: [{ type: String }],
  fetched_at: { type: Date, default: Date.now },
});

export const PhraseCache = models.PhraseCache || model<IPhraseCacheDocument>('PhraseCache', phraseCacheSchema);
