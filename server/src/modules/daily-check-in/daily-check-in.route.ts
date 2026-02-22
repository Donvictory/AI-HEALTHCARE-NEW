import { Router } from "express";
import { DailyCheckInController } from "./daily-check-in.controller";
import {
  createDailyCheckInValidator,
  updateDailyCheckInValidator,
} from "./daily-check-in.validator";
import { protect } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";

const router = Router();
const controller = new DailyCheckInController();

// All daily check-in routes are protected
router.use(protect);

// POST /api/v1/daily-check-ins — Submit a full check-in (all 5 steps at once)
router.post(
  "/",
  createDailyCheckInValidator,
  validateRequest,
  controller.create.bind(controller),
);

// GET /api/v1/daily-check-ins — Get all check-ins for the current user
router.get("/", controller.getAll.bind(controller));

// GET /api/v1/daily-check-ins/today — Get today's check-in (if exists)
router.get("/today", controller.getToday.bind(controller));

// GET /api/v1/daily-check-ins/:id
router.get("/:id", controller.getById.bind(controller));

// PATCH /api/v1/daily-check-ins/:id — Update a specific check-in
router.patch(
  "/:id",
  updateDailyCheckInValidator,
  validateRequest,
  controller.update.bind(controller),
);

// DELETE /api/v1/daily-check-ins/:id
router.delete("/:id", controller.delete.bind(controller));

export default router;
