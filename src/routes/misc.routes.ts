import { Router } from 'express';
import { recordInteraction } from '../controllers/recipe.controller';
import { getStats, subscribeNewsletter, getRecentReviews } from '../controllers/misc.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as Joi from 'joi';

const router = Router();

const interactionSchema = Joi.object({
  recipeId: Joi.string().required(),
  type: Joi.string().valid('view', 'like').required(),
});

const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
});

router.post('/interactions', requireAuth, validate(interactionSchema), recordInteraction);
router.get('/stats', getStats);
router.get('/reviews/recent', getRecentReviews);
router.post('/newsletter', validate(newsletterSchema), subscribeNewsletter);

export default router;
