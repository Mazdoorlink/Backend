import { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
  public statusCode: ContentfulStatusCode;

  constructor(message: string, statusCode: ContentfulStatusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}
