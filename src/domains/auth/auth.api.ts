import { createRoute, z } from "@hono/zod-openapi";
import { registerSchema, loginSchema } from "./auth.validation";
import { successResponse, errorResponse } from "../../utils/apiSchema";

const userResponseSchema = z.object({
  id: z.string().uuid(),
  mobile: z.string(),
  role: z.string(),
});

// The input schema for the refresh endpoint
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// The output schema for tokens
const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Authentication"],
  request: { body: { content: { "application/json": { schema: registerSchema } } } },
  responses: {
    201: successResponse(userResponseSchema, "User registered successfully"),
    400: errorResponse("Validation Error or User Exists"),
  },
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Authentication"],
  request: { body: { content: { "application/json": { schema: loginSchema } } } },
  responses: {
    200: successResponse(
      tokenResponseSchema.extend({ user: userResponseSchema }),
      "Login successful",
    ),
    401: errorResponse("Invalid credentials"),
  },
});

// New Route Definition
export const refreshRoute = createRoute({
  method: "post",
  path: "/refresh-token",
  tags: ["Authentication"],
  request: { body: { content: { "application/json": { schema: refreshTokenSchema } } } },
  responses: {
    200: successResponse(tokenResponseSchema, "Tokens refreshed successfully"),
    401: errorResponse("Invalid or expired refresh token"),
  },
});
