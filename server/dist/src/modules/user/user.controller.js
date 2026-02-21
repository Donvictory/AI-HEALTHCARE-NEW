"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../modules/user/user.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const userService = new user_service_1.UserService();
class UserController {
    register = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        // NOTE: Removed validationResult check as it is now handled by validateRequest middleware
        const { user, token } = await userService.registerUser(req.body);
        // Remove password from output
        user.password = undefined;
        (0, api_response_util_1.sendSuccess)(res, { token, user }, "User registered successfully", 201);
    });
    login = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        // NOTE: Removed validationResult check here too
        const { email, password } = req.body;
        const { user, token } = await userService.loginUser(email, password);
        user.password = undefined;
        (0, api_response_util_1.sendSuccess)(res, { token, user }, "Login successful", 200);
    });
    getAll = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const users = await userService.getAllUsers();
        (0, api_response_util_1.sendSuccess)(res, { results: users.length, users }, "Users retrieved successfully", 200);
    });
    getMe = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const user = await userService.getUserById(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { user }, "User profile retrieved successfully", 200);
    });
    updateMe = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        const allowedUpdates = { ...req.body };
        delete allowedUpdates.password;
        delete allowedUpdates.role;
        delete allowedUpdates.email;
        const updatedUser = await userService.updateUserById(req.user.id, allowedUpdates);
        (0, api_response_util_1.sendSuccess)(res, { user: updatedUser }, "User profile updated successfully", 200);
    });
}
exports.UserController = UserController;
