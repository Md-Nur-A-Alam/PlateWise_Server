import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import { ApiError } from '../utils/apiResponse';

export const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return next(new ApiError(400, 'Validation Error', errorMessages));
  }
  next();
};
