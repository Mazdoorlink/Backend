import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Missing or invalid token' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      // Decode and verify the JWT
      const decodedPayload = await verify(token, c.env.JWT_SECRET, 'HS256');

      // Check if the user's role is in the allowed list
      if (!allowedRoles.includes(decodedPayload.role as string)) {
        return c.json({ success: false, message: 'Unauthorized access' }, 403);
      }

      // Attach user info to context for downstream use
      c.set('user', decodedPayload);
      await next();
    } catch (error) {
      return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }
  };
};
