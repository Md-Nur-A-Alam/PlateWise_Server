import jwt from 'jsonwebtoken';
import fs from 'fs';
import { User } from './src/models/User';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await User.findOne({ email: 'demo@platewise.com' });
  const token = jwt.sign({ id: user._id }, process.env.BETTER_AUTH_SECRET as string);
  console.log('Generated token:', token);
  mongoose.disconnect();
}
run();
