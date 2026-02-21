"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../modules/user/user.controller");
const user_validator_1 = require("../../modules/user/user.validator");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_entity_1 = require("../../modules/user/user.entity");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Public routes
router.post("/register", user_validator_1.createUserValidator, userController.register);
router.post("/login", user_validator_1.loginValidator, userController.login);
// Protected routes
router.use(auth_middleware_1.protect);
router.get("/me", userController.getMe);
// Restrict to admins and above
router.use((0, auth_middleware_1.restrictTo)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN));
router.get("/", userController.getAll);
exports.default = router;
