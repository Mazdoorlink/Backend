// src/utils/appFactory.ts
import { OpenAPIHono } from '@hono/zod-openapi';

// This factory function creates a new router with the FRS-compliant error hook attached
export const createRouter = <T extends Record<string, any> = object>() => {
  return new OpenAPIHono<T>({
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
