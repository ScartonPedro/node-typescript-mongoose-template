// Dependencies
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

// Helpers
import catchAsync from '@shared/utils/catch-async';
import { errors } from '@shared/utils/app-errors';

/**
 * Middleware to get errors from express-validator validation and sends them back to the user
 */
export const validateBody: RequestHandler = catchAsync(
  async (req, res, next) => {
    const bodyErrors = validationResult(req);
    if (!bodyErrors.isEmpty()) {
      const missingParamsErrors: string[] = [];
      const wrongTypeErrors: string[] = [];

      bodyErrors.array().map((error) => {
        error.value
          ? wrongTypeErrors.push(error.param)
          : missingParamsErrors.push(error.param);
      });

      if (missingParamsErrors.length !== 0) {
        throw errors.params(missingParamsErrors);
      }

      if (wrongTypeErrors.length !== 0) {
        throw errors.wrong_type(wrongTypeErrors);
      }

      return res.status(400).json({ errors: bodyErrors.array() });
    }

    next();
  }
);
