"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const app_error_util_1 = require("../utils/app-error.util");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new app_error_util_1.AppError(errors.array()[0].msg, 400));
    }
    next();
};
exports.validateRequest = validateRequest;
