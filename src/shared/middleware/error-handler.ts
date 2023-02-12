import { NextFunction, Request, Response } from 'express';
import { CastError } from 'mongoose';
import { getClientIp } from '@supercharge/request-ip/dist';

import { HttpError } from '../models';
import { ValidationErrors } from '../types/validation-errors.types';
import { generateError } from '../utils/app-errors';
import { dateAndTime } from '@shared/utils/log-date';
import { Notifier } from '@shared/helpers/classes/notifier.class';

import { NODE_ENV } from '@shared/constants/env';

const handleCastErrorDB = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return generateError(message, 400, 'CAST_ERROR');
};

type DuplicateFieldsError = {
  keyValue: { [fieldName: string]: any };
};

const handleDuplicateFieldsDB = (err: DuplicateFieldsError) => {
  const fieldName = Object.keys(err.keyValue)[0];
  const message = `Duplicated value '${err.keyValue[fieldName]}' for '${fieldName}' field. Please use another value!`;

  return generateError(message, 422, 'VALIDATION_ERROR', {
    [fieldName]: { type: 'DUPLICATED', value: err.keyValue[fieldName] },
  });
};

type ValidatorError = {
  [key: string]: {
    properties: {
      [key: string]: any;
    };
  };
};

const handleValidationErrorDB = (err: { errors: ValidatorError }) => {
  const errors = Object.keys(err.errors).reduce(
    (acc: ValidationErrors, key) => {
      const error = err.errors[key];

      if (!error.properties) {
        acc[key] = {
          type: 'UNEXPECTED',
        };
        return acc;
      }

      const { type, message, value } = error.properties;
      acc[key] = {
        type: (type === 'user defined' ? message : type).toUpperCase(),
        expected: error.properties[type],
        value,
      };
      return acc;
    },
    {}
  );

  return generateError('Validation Error', 422, 'VALIDATION_ERROR', errors);
};

const handleJWTError = () =>
  generateError('Invalid token', 401, 'INVALID_TOKEN');

const sendErrorDev = (err: HttpError, req: Request, res: Response) => {
  notifyError(err, req);
  res.status(err.status).json({
    code: err.code,
    message: err.message,
    error: err,
  });
};

const sendErrorProd = (err: HttpError, req: Request, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    notifyError(err, req);

    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }

  // Code here is undefined, so we set it
  err.code = 'INTERNAL_SERVER_ERROR';
  notifyError(err, req);

  // Programming or other unknown error: don't leak error details
  // 1) Log error
  // eslint-disable-next-line no-console
  console.error('ERROR 💥', err);

  // 2) Send generic message
  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Oops! Something went wrong...',
  });
};

const notifyError = (err: HttpError, req: Request) => {
  const status = err.status || 500;
  // Avoid notifying on 'not found (404)', 'validation (422)' or 'rate limit (429)' errors
  if (status > 404 && status !== 422 && status !== 429) {
    // Notify admins of important errors
    const { method, originalUrl, headers, params, query, body } = req;

    // Prevent sending sensitive information
    delete body.password;
    delete body.oldPassword;
    delete body.newPassword;
    delete body.token;

    const data = {
      Date: dateAndTime(),
      IP: getClientIp(req),
      Headers: JSON.stringify(headers),
      Parameters: JSON.stringify(params),
      Query: JSON.stringify(query),
      Body: JSON.stringify(body),
      'HTTP Method': method,
      URL: `${originalUrl.split('?')[0]}`,
      'Error Code': err.code,
      'Error Status': status,
      'Error Stack': err.stack,
    };

    Notifier.notifyDevTeam({
      subject: 'Gateway - Unexpected Error',
      templateName: 'requestError',
      templateValues: { data },
    });
  }
};

export default function ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (['JsonWebTokenError', 'TokenExpiredError'].includes(err.name))
    error = handleJWTError();

  error.status = error.status || 500;

  // eslint-disable-next-line no-console
  console.log(err.stack);

  if (NODE_ENV === 'production') {
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(error, req, res);
  }
}
