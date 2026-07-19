import { Router } from 'express';
import { recordInteraction } from '../controllers/recipe.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import Joi from 'joi';

const router = Router();

const interactionSchema = Joi.object({
  recipeId: Joi.string().required(),
  type: Joi.string().valid('view', 'like').required(),
});

router.post('/interactions', requireAuth, validate(interactionSchema), recordInteraction);

export default router;
