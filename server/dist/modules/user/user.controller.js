"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../modules/user/user.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const express_validator_1 = require("express-validator");
const app_error_util_1 = require("../../utils/app-error.util");
const userService = new user_service_1.UserService();
class UserController {
    register = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new app_error_util_1.AppError(errors.array()[0].msg, 400));
        }
        const { user, token } = await userService.registerUser(req.body);
        // Remove password from output
        user.password = undefined;
        res.status(201).json({
            status: "success",
            token,
            data: { user },
        });
    });
    login = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new app_error_util_1.AppError(errors.array()[0].msg, 400));
        }
        const { email, password } = req.body;
        const { user, token } = await userService.loginUser(email, password);
        user.password = undefined;
        res.status(200).json({
            status: "success",
            token,
            data: { user },
        });
    });
    getAll = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const users = await userService.getAllUsers();
        res.status(200).json({
            status: "success",
            results: users.length,
            data: { users },
        });
    });
    getMe = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const user = await userService.getUserById(req.user.id);
        res.status(200).json({
            status: "success",
            data: { user },
        });
    });
}
exports.UserController = UserController;
