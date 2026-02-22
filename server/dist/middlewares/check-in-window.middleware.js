"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictToCheckInWindow = void 0;
const app_error_util_1 = require("../utils/app-error.util");
/**
 * Restriction: Only allow daily check-ins after 6 PM (18:00) server time.
 */
const restrictToCheckInWindow = (req, res, next) => {
    const currentHour = new Date().getHours();
    // 18:00 is 6 PM
    if (currentHour < 18 && process.env.NODE_ENV !== "development") {
        return next(new app_error_util_1.AppError("Daily check-in is only available at the end of the day (after 6 PM).", 400));
    }
    next();
};
exports.restrictToCheckInWindow = restrictToCheckInWindow;
