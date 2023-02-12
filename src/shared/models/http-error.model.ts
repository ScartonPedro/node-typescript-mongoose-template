import { ValidationErrors } from '../types/validation-errors.types';

export class HttpError extends Error {
  public isOperational: boolean;

  constructor(
    public message: string,
    public status: number,
    public code?: string | number,
    public validationErrors?: ValidationErrors
  ) {
    super(message);

    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
    this.isOperational = true;
  }
}
