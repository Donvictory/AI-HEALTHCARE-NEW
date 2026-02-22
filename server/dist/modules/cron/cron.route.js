"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const daily_reset_service_1 = require("../../services/daily-reset.service");
const api_response_util_1 = require("../../utils/api-response.util");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/cron/daily-reset
 * Triggered by Vercel Cron or manual admin call.
 * Securing with a Bearer Token or secret header recommended in production.
 */
router.get("/daily-reset", async (req, res) => {
    try {
        // Basic security check (optional, but good for Vercel)
        const secret = req.headers["x-cron-secret"];
        if (process.env.NODE_ENV === "production" &&
            secret !== process.env.CRON_SECRET) {
            return (0, api_response_util_1.sendError)(res, "Unauthorized cron trigger", 401);
        }
        const result = await (0, daily_reset_service_1.resetDailyChecks)();
        (0, api_response_util_1.sendSuccess)(res, result, "Daily reset triggered successfully");
    }
    catch (error) {
        (0, api_response_util_1.sendError)(res, error.message, 500);
    }
});
exports.default = router;
