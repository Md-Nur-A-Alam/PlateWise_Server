import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  recipeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
