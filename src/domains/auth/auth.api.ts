import { createRoute, z } from '@hono/zod-openapi';
import { registerSchema, loginSchema, logoutSchema, refreshTokenSchema } from './auth.validation';
import { successResponse, errorResponse } from '../../utils/apiSchema';
import { USER_ROLES } from '../../types/constants';
import { AUTH_ERRORS, AUTH_SUCCESS } from './auth.messages';

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
    201: successResponse(userResponseSchema, AUTH_SUCCESS.REGISTER),
    400: errorResponse('Validation Error or Terms not accepted'),
    409: errorResponse(AUTH_ERRORS.USER_EXISTS),
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
      AUTH_SUCCESS.LOGIN,
    ),
    400: errorResponse(AUTH_ERRORS.PASSWORD_NOT_SET),
    401: errorResponse(AUTH_ERRORS.INVALID_CREDENTIALS),
    403: errorResponse(AUTH_ERRORS.ACCOUNT_INACTIVE_GENERIC),
  },
});

export const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh-token',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: refreshTokenSchema } } } },
  responses: {
    200: successResponse(tokenResponseSchema, AUTH_SUCCESS.REFRESH),
    401: errorResponse(AUTH_ERRORS.TOKEN_INVALID),
  },
});

export const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: logoutSchema } } } },
  responses: {
    200: successResponse(z.null(), AUTH_SUCCESS.LOGOUT),
    400: errorResponse(AUTH_ERRORS.ACCOUNT_INACTIVE_GENERIC),
    401: errorResponse(AUTH_ERRORS.TOKEN_INVALID),
  },
});
