import { OpenAPIHono } from "@hono/zod-openapi";
import { registerRoute, loginRoute, refreshRoute } from "./auth.api";
import { AuthService } from "./auth.service";
import { createRouter } from "../../utils/appFactory";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

const authRoutes = createRouter<{ Bindings: Bindings }>();

authRoutes.openapi(registerRoute, async (c) => {
  const data = c.req.valid("json");
  const authService = new AuthService(c.env);
  try {
    const user = await authService.register(data);
    return c.json({ success: true as const, message: "User registered", data: user }, 201);
  } catch (error: any) {
    return c.json({ success: false as const, message: error.message }, 400);
  }
});

authRoutes.openapi(loginRoute, async (c) => {
  const data = c.req.valid("json");
  const authService = new AuthService(c.env);
  try {
    const result = await authService.login(data);
    return c.json({ success: true as const, message: "Login successful", data: result }, 200);
  } catch (error: any) {
    return c.json({ success: false as const, message: error.message }, 401);
  }
});

authRoutes.openapi(refreshRoute, async (c) => {
  const { refreshToken } = c.req.valid("json");
  const authService = new AuthService(c.env);
  try {
    const tokens = await authService.rotateRefreshToken(refreshToken);
    return c.json(
      { success: true as const, message: "Tokens refreshed successfully", data: tokens },
      200,
    );
  } catch (error: any) {
    return c.json({ success: false as const, message: error.message }, 401);
  }
});

export default authRoutes;
