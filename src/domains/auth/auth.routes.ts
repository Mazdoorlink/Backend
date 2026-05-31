// src/domains/auth/auth.routes.ts
import { registerRoute, loginRoute, refreshRoute } from "./auth.api";
import { AuthService } from "./auth.service";
import { createRouter } from "../../utils/appFactory";

type Bindings = {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

const authRoutes = createRouter<{ Bindings: Bindings }>();

authRoutes.openapi(registerRoute, async (c) => {
  const data = c.req.valid("json");
  const authService = new AuthService(c.env);

  // No try-catch needed!
  const user = await authService.register(data);
  return c.json(
    { success: true as const, message: "User registered", data: user },
    201,
  );
});

authRoutes.openapi(loginRoute, async (c) => {
  const data = c.req.valid("json");
  const authService = new AuthService(c.env);

  const result = await authService.login(data);
  return c.json(
    { success: true as const, message: "Login successful", data: result },
    200,
  );
});

authRoutes.openapi(refreshRoute, async (c) => {
  const { refreshToken } = c.req.valid("json");
  const authService = new AuthService(c.env);

  const tokens = await authService.rotateRefreshToken(refreshToken);
  return c.json(
    {
      success: true as const,
      message: "Tokens refreshed successfully",
      data: tokens,
    },
    200,
  );
});

export default authRoutes;
