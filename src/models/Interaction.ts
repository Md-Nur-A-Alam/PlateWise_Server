import mongoose, { Schema, Document } from 'mongoose';

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  recipeId: mongoose.Types.ObjectId;
  type: 'view' | 'like';
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<IInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  type: { type: String, enum: ['view', 'like'], required: true },
}, { timestamps: true });

InteractionSchema.index({ userId: 1, recipeId: 1, type: 1 }, { unique: true });

export const Interaction = mongoose.model<IInteraction>('Interaction', InteractionSchema);
