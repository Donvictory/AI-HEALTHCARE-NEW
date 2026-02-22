"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const daily_check_in_controller_1 = require("./daily-check-in.controller");
const daily_check_in_validator_1 = require("./daily-check-in.validator");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_request_middleware_1 = require("../../middlewares/validate-request.middleware");
const router = (0, express_1.Router)();
const controller = new daily_check_in_controller_1.DailyCheckInController();
// POST /api/v1/daily-check-ins - Submit all 5 steps at once
// Restrictions: Must be logged in AND only allowed after 6pm
router.post("/", auth_middleware_1.protect, 
// restrictToCheckInWindow,
daily_check_in_validator_1.createDailyCheckInValidator, validate_request_middleware_1.validateRequest, controller.create.bind(controller));
// All daily check-in routes are protected
router.use(auth_middleware_1.protect);
// GET /api/v1/daily-check-ins — Get all check-ins for the current user
router.get("/", controller.getAll.bind(controller));
// GET /api/v1/daily-check-ins/today — Get today's check-in (if exists)
router.get("/today", controller.getToday.bind(controller));
// GET /api/v1/daily-check-ins/:id
router.get("/:id", controller.getById.bind(controller));
// PATCH /api/v1/daily-check-ins/:id — Update a specific check-in
router.patch("/:id", daily_check_in_validator_1.updateDailyCheckInValidator, validate_request_middleware_1.validateRequest, controller.update.bind(controller));
// DELETE /api/v1/daily-check-ins/:id
router.delete("/:id", controller.delete.bind(controller));
exports.default = router;
