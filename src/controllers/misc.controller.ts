import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { Recipe } from '../models/Recipe';
import { Review } from '../models/Review';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const totalRecipes = await Recipe.countDocuments();
  const totalReviews = await Review.countDocuments();
  const distinctCuisines = await Recipe.distinct('cuisine');

  res.status(200).json(new ApiResponse(200, {
    totalRecipes,
    totalReviews,
    totalCuisines: distinctCuisines.length,
  }, 'Stats fetched successfully'));
});

export const getRecentReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(3).populate('user', 'name');
  res.status(200).json(new ApiResponse(200, reviews, 'Recent reviews fetched successfully'));
});

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    throw new ApiError(400, 'Email is already subscribed');
  }

  const subscriber = await NewsletterSubscriber.create({ email });

  res.status(201).json(new ApiResponse(201, subscriber, 'Subscribed successfully'));
});
