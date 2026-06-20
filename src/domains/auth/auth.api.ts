import { createRoute, z } from '@hono/zod-openapi';
import { registerSchema, loginSchema, logoutSchema, refreshTokenSchema } from './auth.validation';
import { successResponse, errorResponse } from '../../utils/apiSchema';

const userResponseSchema = z.object({
  id: z.uuid(),
  mobile: z.string(),
  role: z.string(),
});

// The output schema for tokens
const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: registerSchema } } } },
  responses: {
    201: successResponse(userResponseSchema, 'User registered successfully'),
    400: errorResponse('Validation Error or User Exists'),
  },
});

export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: successResponse(
      tokenResponseSchema.extend({ user: userResponseSchema }),
      'Login successful',
    ),
    401: errorResponse('Invalid credentials'),
  },
});

export const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh-token',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: refreshTokenSchema } } } },
  responses: {
    200: successResponse(tokenResponseSchema, 'Tokens refreshed successfully'),
    401: errorResponse('Invalid or expired refresh token'),
  },
});

export const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: logoutSchema } } } },
  responses: {
    200: successResponse(z.null(), 'Logged out successfully'),
    400: errorResponse('Invalid or expired refresh token'),
  },
});
