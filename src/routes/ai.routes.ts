import { Router } from 'express';
import { generateRecipe, getRecommendations } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as Joi from 'joi';

const router = Router();

const generateRecipeSchema = Joi.object({
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  cuisine: Joi.string().required(),
  servings: Joi.number().positive().required(),
  length: Joi.string().valid('short', 'detailed').required(),
});

router.post('/generate-recipe', requireAuth, validate(generateRecipeSchema), generateRecipe);
router.get('/recommendations', requireAuth, getRecommendations);

export default router;
