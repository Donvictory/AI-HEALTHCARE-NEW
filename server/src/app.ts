import express, { Express, Request, Response } from "express";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { AppError } from "./utils/app-error.util";
import userRouter from "./modules/user/user.route";

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

app.use("/api/v1/users", userRouter);

// Unhandled Routes
app.all("*", (req: Request, res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
