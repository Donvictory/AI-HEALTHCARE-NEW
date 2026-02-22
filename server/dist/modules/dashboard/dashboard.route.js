"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
router.get("/", auth_middleware_1.protect, controller.getMetrics.bind(controller));
exports.default = router;
