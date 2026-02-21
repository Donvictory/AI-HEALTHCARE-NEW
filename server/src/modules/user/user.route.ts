import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserValidator, loginValidator } from "./user.validator";
import { protect, restrictTo } from "../../middlewares/auth.middleware";
import { UserRole } from "./user.entity";

const router = Router();
const userController = new UserController();

// Public routes
router.post("/register", createUserValidator, userController.register);
router.post("/login", loginValidator, userController.login);

// Protected routes
router.use(protect);

router.get("/me", userController.getMe);

// Restrict to admins and above
router.use(restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN));
router.get("/", userController.getAll);

export default router;
