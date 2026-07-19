import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  ingredients: string[];
  images: string[];
  cuisine: string;
  dietType: string[];
  cookTimeMinutes: number;
  difficulty: string;
  authorId: mongoose.Types.ObjectId;
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  ingredients: [{ type: String }],
  images: [{ type: String }],
  cuisine: { type: String, required: true },
  dietType: [{ type: String }],
  cookTimeMinutes: { type: Number, required: true },
  difficulty: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  avgRating: { type: Number, default: 0 },
}, { timestamps: true });

RecipeSchema.index({ cuisine: 1 });
RecipeSchema.index({ dietType: 1 });
RecipeSchema.index({ title: 'text' });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ avgRating: -1 });
RecipeSchema.index({ cookTimeMinutes: 1 });

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
