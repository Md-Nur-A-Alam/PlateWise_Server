import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const NewsletterSubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const NewsletterSubscriber = mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
