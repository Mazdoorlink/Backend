import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import authRoutes from "./domains/auth/auth.routes";
import { createRouter } from "./utils/appFactory";
import { globalErrorHandler } from "./middlewares/errorHandler";

// Use OpenAPIHono instead of standard Hono
const app = createRouter().basePath("/api/v1");

app.use("*", cors());

app.onError(globalErrorHandler);

// Mount domains
app.route("/auth", authRoutes);

// Generate the OpenAPI JSON spec
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "MazdoorLink API",
    description: "Enterprise Functional Specification API",
  },
});

// Serve the Swagger UI
app.get("/swagger", swaggerUI({ url: "/api/v1/doc" }));

export default app;
