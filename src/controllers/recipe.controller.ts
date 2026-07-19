import { Request, Response } from 'express';
import { Recipe } from '../models/Recipe';
import { Interaction } from '../models/Interaction';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getRecipes = asyncHandler(async (req: Request, res: Response) => {
  const { search, cuisine, dietType, sort, page = 1, limit = 12 } = req.query;
  const query: any = {};

  if (search) {
    query.$text = { $search: search as string };
  }
  if (cuisine) query.cuisine = cuisine;
  if (dietType) query.dietType = { $in: (dietType as string).split(',') };

  let sortObj: any = { createdAt: -1 };
  if (sort === 'rating') sortObj = { avgRating: -1 };
  else if (sort === 'cookTime') sortObj = { cookTimeMinutes: 1 };

  const skip = (Number(page) - 1) * Number(limit);
  
  const recipes = await Recipe.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('authorId', 'name image');
    
  const total = await Recipe.countDocuments(query);

  res.status(200).json(new ApiResponse(200, {
    recipes,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total
  }));
});

export const getMyRecipes = asyncHandler(async (req: Request, res: Response) => {
  const recipes = await Recipe.find({ authorId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, recipes, "Fetched user's recipes successfully"));
});

export const getRecipeById = asyncHandler(async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id).populate('authorId', 'name image');
  if (!recipe) throw new ApiError(404, 'Recipe not found');

  // get related recipes (same cuisine, excluding self)
  const related = await Recipe.find({ cuisine: recipe.cuisine, _id: { $ne: recipe._id } }).limit(4);

  // Reviews will be fetched via a separate route or populated. The prompt says "populated author + reviews", 
  // wait, reviews are in a separate collection. Let's fetch them.
  const reviews = await require('../models/Review').Review.find({ recipeId: recipe._id }).populate('userId', 'name image');

  res.status(200).json(new ApiResponse(200, { recipe, related, reviews }));
});

export const createRecipe = asyncHandler(async (req: Request, res: Response) => {
  const recipe = await Recipe.create({
    ...req.body,
    authorId: req.user._id
  });
  res.status(201).json(new ApiResponse(201, recipe, "Recipe created successfully"));
});

export const deleteRecipe = asyncHandler(async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new ApiError(404, 'Recipe not found');
  
  if (recipe.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this recipe');
  }
  
  await recipe.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Recipe deleted successfully"));
});

export const recordInteraction = asyncHandler(async (req: Request, res: Response) => {
  const { recipeId, type } = req.body;
  if (!['view', 'like'].includes(type)) {
    throw new ApiError(400, 'Invalid interaction type');
  }

  // Use upsert to avoid duplicate likes/views if needed, or just insert
  // For views, we might just update the updatedAt if it exists
  const interaction = await Interaction.findOneAndUpdate(
    { userId: req.user._id, recipeId, type },
    { createdAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(new ApiResponse(200, interaction, "Interaction recorded"));
});
