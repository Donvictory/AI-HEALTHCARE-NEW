import { Router } from "express";
import { UserController } from "./user.controller";
import {
  createUserValidator,
  loginValidator,
  updateProfileValidator,
  refreshTokenValidator,
  onboardUserValidator,
} from "./user.validator";
import { protect, restrictTo } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { UserRole } from "./user.entity";
import { cacheApi } from "../../middlewares/cache.middleware";

const router = Router();
const userController = new UserController();

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
router.post(
  "/register",
  createUserValidator,
  validateRequest,
  userController.register.bind(userController),
);

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
router.post(
  "/login",
  loginValidator,
  validateRequest,
  userController.login.bind(userController),
);

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Get a new access token using a valid refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh-token",
  refreshTokenValidator,
  validateRequest,
  userController.refreshToken.bind(userController),
);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", protect, userController.logout.bind(userController));

// Protected routes
router.use(protect);

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
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current authenticated user profile with stats (BMI, check-ins, etc.)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enriched user profile
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", userController.getProfile.bind(userController));

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
router.patch(
  "/me",
  updateProfileValidator,
  validateRequest,
  userController.updateMe.bind(userController),
);

/**
 * @swagger
 * /api/v1/users/onboard:
 *   post:
 *     summary: Complete user onboarding
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
 *     responses:
 *       200:
 *         description: User onboarded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/onboard",
  onboardUserValidator,
  validateRequest,
  userController.onboard.bind(userController),
);

router.delete("/me", userController.deleteMe.bind(userController));

// Restrict to admins and above
router.use(restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN));

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
router.get("/", cacheApi(300), userController.getAll);

export default router;
