import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { generateRecipeContent } from '../services/gemini.service';
import { getSmartRecommendations } from '../services/recommendation.service';
import { User } from '../models/User';

export const generateRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { ingredients, cuisine, servings, length } = req.body;
  
  const draft = await generateRecipeContent({
    ingredients,
    cuisine,
    servings: Number(servings),
    length
  });

  res.status(200).json(new ApiResponse(200, draft, 'AI generated recipe successfully'));
});

export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { dietType, maxCookTime } = req.query;

  // Read user's explicit preferences and allergies
  const user = await User.findById(userId).select('dietaryPreferences allergies');
  
  const preferences = {
    dietType: user?.dietaryPreferences || [],
    allergies: user?.allergies || []
  };

  const filters: any = {};
  if (dietType) filters.dietType = String(dietType);
  if (maxCookTime) filters.maxCookTime = Number(maxCookTime);

  const hasPreferences = preferences.dietType.length > 0 || preferences.allergies.length > 0;

  const recommendations = await getSmartRecommendations(userId.toString(), preferences, filters);

  res.status(200).json(new ApiResponse(200, {
    recommendations,
    hasPreferences
  }, 'Fetched smart recommendations successfully'));
});
