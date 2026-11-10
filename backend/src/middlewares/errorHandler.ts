import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.error('[Error]:', err);

  const isAppError = err instanceof AppError;
  const isValidationError = err instanceof ZodError;
  const isDatabaseUnavailable = err.code === 'P1001';
  const isDuplicateRecord = err.code === 'P2002';
  const statusCode = isAppError
    ? err.statusCode
    : isValidationError
      ? 400
      : isDatabaseUnavailable
        ? 503
        : isDuplicateRecord
          ? 409
          : err.statusCode >= 400 && err.statusCode < 500
            ? err.statusCode
            : 500;
  const message = isAppError
    ? err.message
    : isValidationError
      ? err.issues.map((issue) => issue.message).join(', ')
      : isDatabaseUnavailable
        ? 'The database is temporarily unavailable. Please try again shortly.'
        : isDuplicateRecord
          ? 'A record with these details already exists.'
          : statusCode >= 500
            ? 'Something went wrong. Please try again.'
            : err.message || 'Request failed';

  const errResponse = {
    status: 'error',
    statusCode,
    message,
  };

  if (res.headersSent) {
    // If it's an SSE stream that already started, write raw JSON error and close
    res.write(JSON.stringify(errResponse) + '\n\n');
    res.end();
  } else {
    res.status(statusCode).json(errResponse);
  }
};
