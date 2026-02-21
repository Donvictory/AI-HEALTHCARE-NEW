"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../modules/user/user.controller");
const user_validator_1 = require("../../modules/user/user.validator");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_request_middleware_1 = require("../../middlewares/validate-request.middleware");
const user_entity_1 = require("../../modules/user/user.entity");
const cache_middleware_1 = require("../../middlewares/cache.middleware");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [USER, PATIENT, DOCTOR, MANAGER, ADMIN, SUPER_ADMIN]
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         token:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 */
/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or Email already in use
 */
// Public routes
router.post("/register", user_validator_1.createUserValidator, validate_request_middleware_1.validateRequest, userController.register.bind(userController));
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Incorrect email or password
 */
router.post("/login", user_validator_1.loginValidator, validate_request_middleware_1.validateRequest, userController.login.bind(userController));
// Protected routes
router.use(auth_middleware_1.protect);
/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid token
 */
router.get("/me", userController.getMe.bind(userController));
/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update current authenticated user profile (Onboarding details)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               healthConditions:
 *                 type: array
 *                 items:
 *                   type: string
 *               familyHealthHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *               hasCompletedDailyChecks:
 *                 type: boolean
 *               currentDailyCheckStep:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", user_validator_1.updateProfileValidator, validate_request_middleware_1.validateRequest, userController.updateMe.bind(userController));
// Restrict to admins and above
router.use((0, auth_middleware_1.restrictTo)(user_entity_1.UserRole.SUPER_ADMIN, user_entity_1.UserRole.ADMIN));
/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, user does not have permission
 */
router.get("/", (0, cache_middleware_1.cacheApi)(300), userController.getAll);
exports.default = router;
