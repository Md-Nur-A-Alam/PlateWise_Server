import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string;
  provider?: string;
  dietaryPreferences: string[];
  allergies: string[];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  image: { type: String },
  passwordHash: { type: String },
  provider: { type: String },
  dietaryPreferences: [{ type: String }],
  allergies: [{ type: String }],
}, { timestamps: true, collection: 'user' });

export const User = mongoose.model<IUser>('User', UserSchema);
