// src/domains/auth/auth.routes.ts
import { registerRoute, loginRoute, refreshRoute, logoutRoute } from './auth.api';
import { AuthService } from './auth.service';
import { createRouter } from '../../utils/appFactory';
import { BindingsType } from '../../types';
import { AUTH_SUCCESS } from './auth.messages';

const authRoutes = createRouter<{ Bindings: BindingsType }>();

authRoutes.openapi(registerRoute, async (c) => {
  const data = c.req.valid('json');
  const authService = new AuthService(c.env);

  const user = await authService.register(data);
  return c.json({ success: true as const, message: AUTH_SUCCESS.REGISTER, data: user }, 201);
});

authRoutes.openapi(loginRoute, async (c) => {
  const data = c.req.valid('json');
  const authService = new AuthService(c.env);

  const result = await authService.login(data);
  return c.json({ success: true as const, message: AUTH_SUCCESS.LOGIN, data: result }, 200);
});

authRoutes.openapi(refreshRoute, async (c) => {
  const data = c.req.valid('json');
  const authService = new AuthService(c.env);

  const tokens = await authService.rotateRefreshToken(data);
  return c.json(
    {
      success: true as const,
      message: AUTH_SUCCESS.REFRESH,
      data: tokens,
    },
    200,
  );
});

authRoutes.openapi(logoutRoute, async (c) => {
  const data = c.req.valid('json');
  const authService = new AuthService(c.env);

  await authService.logout(data);
  return c.json(
    {
      success: true as const,
      message: AUTH_SUCCESS.LOGOUT,
      data: null,
    },
    200,
  );
});

export default authRoutes;
