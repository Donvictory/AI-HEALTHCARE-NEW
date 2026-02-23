import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { AppError } from "./utils/app-error.util";
import v1Routes from "./routes/v1.route";
import swaggerSpec from "./config/swagger.config";
import path from "path";

const app: Express = express();

// Middlewares
const ALLOWED_ORIGINS = [
  "https://driftcare.vercel.app",
  "https://drift-care-backend.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (echo the origin) to satisfy 'publicly available' request
      // while still supporting credentials: true
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Explicitly handle OPTIONS preflight for all routes
app.options("*", cors());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Basic health check for API
app.get("/api/health", (_, res) => {
  res.status(200).json({ status: "success", message: "API is healthy" });
});

// Swagger UI (CDN-hosted — works on Vercel serverless)
// Server URL is derived dynamically from the request so local Swagger
// hits localhost and deployed Swagger hits the production URL automatically.
app.get("/api-docs", (req: Request, res: Response) => {
  const protocol =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.headers.host || "localhost:8000";
  const dynamicSpec = {
    ...swaggerSpec,
    servers: [{ url: `${protocol}://${host}`, description: "Current server" }],
  };

  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>AI Healthcare API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          spec: ${JSON.stringify(dynamicSpec)},
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
          deepLinking: true,
        });
      };
    </script>
  </body>
</html>`);
});

app.use("/api/v1", v1Routes);

// --- Static Files & SPA Fallback ---
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

// Swagger UI (CDN-hosted — works on Vercel serverless)
// ... (omitting duplicate code as it's already there)

// Unhandled Routes - If it starts with /api, return 404
app.all("/api/*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// All other routes serve the frontend SPA
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      // If index.html is missing, we fall back to the dynamic welcome message or a generic 404
      if (req.url === "/") {
        res.status(200).json({ status: "success", message: "Welcome to AI-HEALTHCARE-NEW API" });
      } else {
        res.status(404).send("Frontend not built or path not found.");
      }
    }
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
