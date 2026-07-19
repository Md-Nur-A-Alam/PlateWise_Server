import { Router } from 'express';
import { getRecipes, getRecipeById, getMyRecipes, createRecipe, deleteRecipe, recordInteraction } from '../controllers/recipe.controller';
import { addReview } from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import Joi from 'joi';

const router = Router();

const recipeSchema = Joi.object({
  title: Joi.string().required(),
  shortDescription: Joi.string().required(),
  fullDescription: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).required(),
  images: Joi.array().items(Joi.string()),
  cuisine: Joi.string().required(),
  dietType: Joi.array().items(Joi.string()),
  cookTimeMinutes: Joi.number().required(),
  difficulty: Joi.string().required(),
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().optional().allow(''),
});

const interactionSchema = Joi.object({
  recipeId: Joi.string().required(),
  type: Joi.string().valid('view', 'like').required(),
});

router.get('/', getRecipes);
router.get('/mine', requireAuth, getMyRecipes);
router.get('/:id', getRecipeById);
router.post('/', requireAuth, validate(recipeSchema), createRecipe);
router.delete('/:id', requireAuth, deleteRecipe);

// Reviews
router.post('/:id/reviews', requireAuth, validate(reviewSchema), addReview);

export default router;
