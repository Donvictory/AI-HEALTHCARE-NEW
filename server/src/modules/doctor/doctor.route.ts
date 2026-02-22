import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import {
  createDoctorValidator,
  updateDoctorValidator,
  findDoctorsQueryValidator,
} from "./doctor.validator";
import { protect, restrictTo } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { UserRole } from "../user/user.entity";

const router = Router();
const controller = new DoctorController();

// ─── Public routes (no auth needed) ──────────────────────────────────────────

// GET /api/v1/doctors          — list all (filter by ?state&city&specialty&isAvailable)
router.get(
  "/",
  findDoctorsQueryValidator,
  validateRequest,
  controller.getAll.bind(controller),
);

// GET /api/v1/doctors/:id      — single doctor
router.get("/:id", controller.getById.bind(controller));

// ─── Protected: any logged-in user ───────────────────────────────────────────

// GET /api/v1/doctors/nearby   — find doctors near the current user's location
// NOTE: must be declared BEFORE /:id to avoid "nearby" being caught as an id
router.get(
  "/nearby",
  protect,
  findDoctorsQueryValidator,
  validateRequest,
  controller.findNearby.bind(controller),
);

// ─── Admin-only ───────────────────────────────────────────────────────────────

router.post(
  "/",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  createDoctorValidator,
  validateRequest,
  controller.create.bind(controller),
);

router.patch(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateDoctorValidator,
  validateRequest,
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  protect,
  restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  controller.delete.bind(controller),
);

export default router;
