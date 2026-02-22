"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctor_controller_1 = require("./doctor.controller");
const doctor_validator_1 = require("./doctor.validator");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_request_middleware_1 = require("../../middlewares/validate-request.middleware");
const user_entity_1 = require("../user/user.entity");
const router = (0, express_1.Router)();
const controller = new doctor_controller_1.DoctorController();
// ─── Public routes (no auth needed) ──────────────────────────────────────────
// GET /api/v1/doctors          — list all (filter by ?state&city&specialty&isAvailable)
router.get("/", doctor_validator_1.findDoctorsQueryValidator, validate_request_middleware_1.validateRequest, controller.getAll.bind(controller));
// GET /api/v1/doctors/:id      — single doctor
router.get("/:id", controller.getById.bind(controller));
// ─── Protected: any logged-in user ───────────────────────────────────────────
// GET /api/v1/doctors/nearby   — find doctors near the current user's location
// NOTE: must be declared BEFORE /:id to avoid "nearby" being caught as an id
router.get("/nearby", auth_middleware_1.protect, doctor_validator_1.findDoctorsQueryValidator, validate_request_middleware_1.validateRequest, controller.findNearby.bind(controller));
// ─── Admin-only ───────────────────────────────────────────────────────────────
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN), doctor_validator_1.createDoctorValidator, validate_request_middleware_1.validateRequest, controller.create.bind(controller));
router.patch("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN), doctor_validator_1.updateDoctorValidator, validate_request_middleware_1.validateRequest, controller.update.bind(controller));
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN), controller.delete.bind(controller));
exports.default = router;
