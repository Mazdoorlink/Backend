import { ErrorHandler } from "hono";
import { AppError } from "../utils/AppError";
import { HTTPException } from "hono/http-exception";

export const globalErrorHandler: ErrorHandler = (err, c) => {
  // Handle our custom business logic errors
  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.statusCode as any);
  }

  // Handle Hono's built-in HTTP exceptions (like 404s)
  if (err instanceof HTTPException) {
    return c.json({ success: false, message: err.message }, err.status);
  }

  // Handle unexpected server panics/crashes
  // In a real app, you would send this stack trace to Sentry or CloudWatch here
  console.error("[FATAL ERROR]:", err);

  return c.json({ success: false, message: "Internal Server Error" }, 500);
};
