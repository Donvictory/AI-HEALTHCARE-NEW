"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app_error_util_1 = require("./utils/app-error.util");
const v1_route_1 = __importDefault(require("./routes/v1.route"));
const swagger_config_1 = __importDefault(require("./config/swagger.config"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow all origins (echo the origin) to satisfy 'publicly available' request
        // while still supporting credentials: true
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Explicitly handle OPTIONS preflight for all routes
app.options("*", (0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
app.get("/", (_, res) => {
    res
        .status(200)
        .json({ status: "success", message: "Welcome to AI-HEALTHCARE-NEW API" });
});
// Swagger UI (CDN-hosted — works on Vercel serverless)
// Server URL is derived dynamically from the request so local Swagger
// hits localhost and deployed Swagger hits the production URL automatically.
app.get("/api-docs", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers.host || "localhost:8000";
    const dynamicSpec = {
        ...swagger_config_1.default,
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
app.use("/api/v1", v1_route_1.default);
// Unhandled Routes
app.all("*", (req, res, next) => {
    next(new app_error_util_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
