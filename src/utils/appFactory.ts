// src/utils/appFactory.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { Env } from 'hono';

// This factory function creates a new router with the FRS-compliant error hook attached
export const createRouter = <E extends Env = Env>() => {
  return new OpenAPIHono<E>({
    defaultHook: (result, c) => {
      if (!result.success) {
        const cleanErrors = result.error.issues.map((issue) => issue.message);

        return c.json(
          {
            success: false,
            message: 'Validation failed',
            errors: cleanErrors,
          },
          400, // Bad Request
        );
      }
    },
  });
};
