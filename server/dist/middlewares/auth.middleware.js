"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_error_util_1 = require("../utils/app-error.util");
const app_config_1 = __importDefault(require("../config/app.config"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new app_error_util_1.AppError("You are not logged in! Please log in to get access.", 401));
        }
        const decoded = jsonwebtoken_1.default.verify(token, app_config_1.default.jwt.accessSecret);
        const currentUser = await user_model_1.default.findById(decoded.id);
        if (!currentUser) {
            return next(new app_error_util_1.AppError("The user belonging to this token does no longer exist.", 401));
        }
        // Grant access to protected route
        req.user = currentUser;
        next();
    }
    catch (error) {
        next(new app_error_util_1.AppError("Invalid or expired token!", 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new app_error_util_1.AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
