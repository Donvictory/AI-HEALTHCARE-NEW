import express, { Express, Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "@/middlewares/error.middleware";
import { AppError } from "@/utils/app-error.util";
import v1Routes from "@/routes/v1.route";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "@/config/swagger.config";

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/", (_, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Welcome to AI-HEALTHCARE-NEW API" });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", v1Routes);

// Unhandled Routes
app.all("*", (req: Request, res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
