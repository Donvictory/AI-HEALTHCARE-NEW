"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenValidator = exports.onboardUserValidator = exports.updateProfileValidator = exports.loginValidator = exports.createUserValidator = void 0;
const express_validator_1 = require("express-validator");
const user_entity_1 = require("./user.entity");
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
exports.updateProfileValidator = [
    (0, express_validator_1.body)("age").optional().isNumeric().withMessage("Age must be a number"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(Object.values(user_entity_1.Gender))
        .withMessage("Invalid gender"),
    (0, express_validator_1.body)("height").optional().isNumeric().withMessage("Height must be a number"),
    (0, express_validator_1.body)("weight").optional().isNumeric().withMessage("Weight must be a number"),
    (0, express_validator_1.body)("state").optional().isString().withMessage("State must be a string"),
    (0, express_validator_1.body)("city").optional().isString().withMessage("City must be a string"),
    (0, express_validator_1.body)("phoneNumber")
        .optional()
        .isString()
        .withMessage("Phone number must be a string"),
    (0, express_validator_1.body)("healthConditions")
        .optional()
        .isArray()
        .withMessage("Health conditions must be an array"),
    (0, express_validator_1.body)("healthConditions.*")
        .isIn(Object.values(user_entity_1.HealthCondition))
        .withMessage("Invalid health condition"),
    (0, express_validator_1.body)("familyHealthHistory")
        .optional()
        .isArray()
        .withMessage("Family health history must be an array"),
    (0, express_validator_1.body)("familyHealthHistory.*")
        .isIn(Object.values(user_entity_1.FamilyHealthHistory))
        .withMessage("Invalid family health history"),
    (0, express_validator_1.body)("hasCompletedDailyChecks").optional().isBoolean(),
    (0, express_validator_1.body)("currentDailyCheckStep").optional().isNumeric(),
    (0, express_validator_1.body)("isFirstLogin").optional().isBoolean(),
];
exports.onboardUserValidator = [
    (0, express_validator_1.body)("age").optional().isNumeric().withMessage("Age must be a number"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(Object.values(user_entity_1.Gender))
        .withMessage("Invalid gender"),
    (0, express_validator_1.body)("height").optional().isNumeric().withMessage("Height must be a number"),
    (0, express_validator_1.body)("weight").optional().isNumeric().withMessage("Weight must be a number"),
    (0, express_validator_1.body)("state").optional().isString().withMessage("State must be a string"),
    (0, express_validator_1.body)("city").optional().isString().withMessage("City must be a string"),
    (0, express_validator_1.body)("phoneNumber")
        .optional()
        .isString()
        .withMessage("Phone number must be a string"),
    (0, express_validator_1.body)("healthConditions")
        .optional()
        .isArray()
        .withMessage("Health conditions must be an array"),
    (0, express_validator_1.body)("healthConditions.*")
        .isIn(Object.values(user_entity_1.HealthCondition))
        .withMessage("Invalid health condition"),
    (0, express_validator_1.body)("familyHealthHistory")
        .optional()
        .isArray()
        .withMessage("Family health history must be an array"),
    (0, express_validator_1.body)("familyHealthHistory.*")
        .isIn(Object.values(user_entity_1.FamilyHealthHistory))
        .withMessage("Invalid family health history"),
];
exports.refreshTokenValidator = [
    // Refresh token may arrive either as an httpOnly cookie (primary) or in the
    // request body (legacy / non-browser clients). Make the body field optional.
    (0, express_validator_1.body)("refreshToken").optional().isString(),
];
