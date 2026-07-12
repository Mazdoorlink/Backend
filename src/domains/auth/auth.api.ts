import { createRoute, z } from '@hono/zod-openapi';
import { registerSchema, loginSchema, logoutSchema, refreshTokenSchema } from './auth.validation';
import { successResponse, errorResponse } from '../../utils/apiSchema';
import { USER_ROLES } from '../../types/constants';

const userResponseSchema = z.object({
  id: z.uuid(),
  mobile: z.string(),
  role: z.enum(USER_ROLES),
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
    409: errorResponse('User already exists with this mobile number'),
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
    400: errorResponse('Account missing password (OTP only account)'),
    401: errorResponse('Invalid credentials'),
    403: errorResponse('Account is blocked, inactive, or suspended'),
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
    400: errorResponse('User account is inactive or deleted'),
    401: errorResponse('Invalid or expired refresh token'),
  },
});
