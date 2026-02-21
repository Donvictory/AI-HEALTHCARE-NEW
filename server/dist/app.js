"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app_error_util_1 = require("./utils/app-error.util");
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
// Routes
app.get("/health", (req, res) => {
    res.status(200).json({ status: "success", message: "Server is healthy" });
});
app.use("/api/v1/users", user_route_1.default);
// Unhandled Routes
app.all("*", (req, res, next) => {
    next(new app_error_util_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
