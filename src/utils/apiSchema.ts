import { z } from "@hono/zod-openapi";

// Standard Success Response
export const successResponse = (dataSchema: z.ZodTypeAny, description = "Success") => ({
  description,
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true).openapi({ example: true }),
        message: z.string().openapi({ example: "Operation successful" }),
        data: dataSchema,
      }),
    },
  },
});

// Standard Error Response
export const errorResponse = (description = "Error occurred") => ({
  description,
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(false).openapi({ example: false }),
        message: z.string().openapi({ example: "Validation failed" }),
        errors: z.array(z.any()).optional(),
      }),
    },
  },
});
