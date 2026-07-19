import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Recipe } from '../models/Recipe';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { id: recipeId } = req.params;
  const { rating, comment } = req.body;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new ApiError(404, 'Recipe not found');

  const review = await Review.create({
    recipeId,
    userId: req.user._id,
    rating,
    comment
  });

  // recalculate avg rating
  const reviews = await Review.find({ recipeId });
  const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
  
  recipe.avgRating = Number(avgRating.toFixed(1));
  await recipe.save();

  res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});
