"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.createUserValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidator = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];
exports.loginValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
