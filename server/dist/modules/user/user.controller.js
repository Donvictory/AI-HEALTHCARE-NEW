"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const app_config_1 = require("../../config/app.config");
const push_notifications_util_1 = require("../../utils/push-notifications.util");
const userService = new user_service_1.UserService();
// 7 days in milliseconds
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// 1 hour in milliseconds
const ACCESS_TOKEN_COOKIE_MAX_AGE = 1 * 60 * 60 * 1000;
const setAuthCookies = (res, accessToken, refreshToken, isOnboarded = false) => {
    const isProd = app_config_1.appConfig.env === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    };
    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
    // Client-side hint (not httpOnly) so JS can check if a session exists
    res.cookie("is_logged_in", "true", {
        ...cookieOptions,
        httpOnly: false,
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
    // Client-side hint for onboarding status
    res.cookie("is_onboarded", String(isOnboarded), {
        ...cookieOptions,
        httpOnly: false,
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
};
class UserController {
    // ─── Auth ──────────────────────────────────────────────────────────────────
    register = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const { user, accessToken, refreshToken } = await userService.registerUser(req.body);
        user.password = undefined;
        setAuthCookies(res, accessToken, refreshToken, user.isOnboarded);
        (0, api_response_util_1.sendSuccess)(res, { user }, "User registered successfully", 201);
    });
    login = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const { user, accessToken, refreshToken } = await userService.loginUser(req.body);
        user.password = undefined;
        setAuthCookies(res, accessToken, refreshToken, user.isOnboarded);
        (0, api_response_util_1.sendSuccess)(res, { user }, "Login successful", 200);
    });
    refreshToken = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            return next(new (await Promise.resolve().then(() => __importStar(require("../../utils/app-error.util")))).AppError("Refresh token not found", 401));
        }
        const { accessToken } = await userService.refreshAccessToken(token);
        const isProd = app_config_1.appConfig.env === "production";
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
        });
        (0, api_response_util_1.sendSuccess)(res, null, "Access token refreshed", 200);
    });
    logout = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const isProd = app_config_1.appConfig.env === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        };
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("is_logged_in", { ...cookieOptions, httpOnly: false });
        res.clearCookie("is_onboarded", { ...cookieOptions, httpOnly: false });
        (0, api_response_util_1.sendSuccess)(res, null, "Logged out successfully", 200);
    });
    // ─── Profile ───────────────────────────────────────────────────────────────
    getMe = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const user = await userService.getUserById(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { user }, "User profile retrieved successfully", 200);
    });
    getProfile = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const data = await userService.getEnrichedProfile(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, data, "Enriched profile retrieved successfully", 200);
    });
    updateMe = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const allowedUpdates = { ...req.body };
        delete allowedUpdates.password;
        delete allowedUpdates.role;
        delete allowedUpdates.email;
        const updatedUser = await userService.updateUserById(req.user.id, allowedUpdates);
        console.log("UserController.updateMe - User after update:", JSON.stringify(updatedUser, null, 2));
        (0, api_response_util_1.sendSuccess)(res, { user: updatedUser }, "Profile updated successfully", 200);
    });
    onboard = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const allowedUpdates = { ...req.body };
        delete allowedUpdates.password;
        delete allowedUpdates.role;
        delete allowedUpdates.email;
        const updatedUser = await userService.onboardUser(req.user.id, allowedUpdates);
        // Update the onboarding hint cookie
        const isProd = app_config_1.appConfig.env === "production";
        res.cookie("is_onboarded", "true", {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        });
        (0, api_response_util_1.sendSuccess)(res, { user: updatedUser }, "User onboarded successfully", 200);
        // Send welcome notification
        (0, push_notifications_util_1.sendPushNotification)(updatedUser, {
            title: "Welcome to DriftCare! 🚀",
            body: "Your health profile is now active. We'll notify you of any health drift detected.",
        });
    });
    subscribeNotifications = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const { subscription } = req.body;
        await userService.updateUserById(req.user.id, {
            pushSubscription: subscription,
        });
        (0, api_response_util_1.sendSuccess)(res, null, "Notifications subscribed successfully", 200);
    });
    deleteMe = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        await userService.deleteUserById(req.user.id);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        (0, api_response_util_1.sendSuccess)(res, null, "Account deleted successfully", 204);
    });
    // ─── Admin ─────────────────────────────────────────────────────────────────
    getAll = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const users = await userService.getAllUsers();
        (0, api_response_util_1.sendSuccess)(res, { results: users.length, users }, "Users retrieved successfully", 200);
    });
}
exports.UserController = UserController;
