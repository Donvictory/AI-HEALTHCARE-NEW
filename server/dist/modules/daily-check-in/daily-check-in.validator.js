"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDailyCheckInValidator = exports.createDailyCheckInValidator = void 0;
const express_validator_1 = require("express-validator");
const daily_check_in_entity_1 = require("./daily-check-in.entity");
// ─── Full check-in validator ──────────────────────────────────────────────────
exports.createDailyCheckInValidator = [
    // Step 1
    (0, express_validator_1.body)("hoursSlept")
        .isFloat({ min: 0, max: 24 })
        .withMessage("hoursSlept must be between 0 and 24"),
    (0, express_validator_1.body)("stressLevel")
        .isInt({ min: 1, max: 10 })
        .withMessage("stressLevel must be between 1 and 10"),
    (0, express_validator_1.body)("currentMood")
        .isInt({ min: 1, max: 10 })
        .withMessage("currentMood must be between 1 and 10"),
    // Step 2
    (0, express_validator_1.body)("dailyActivityMeasure")
        .isFloat({ min: 0 })
        .withMessage("dailyActivityMeasure must be a positive number (minutes)"),
    (0, express_validator_1.body)("numOfWaterGlasses")
        .isInt({ min: 0 })
        .withMessage("numOfWaterGlasses must be a non-negative integer"),
    // Step 3
    (0, express_validator_1.body)("currentHealthStatus")
        .isIn(Object.values(daily_check_in_entity_1.CurrentHealthStatus))
        .withMessage(`currentHealthStatus must be one of: ${Object.values(daily_check_in_entity_1.CurrentHealthStatus).join(", ")}`),
    (0, express_validator_1.body)("symptomsToday")
        .optional()
        .isArray()
        .withMessage("symptomsToday must be an array"),
    (0, express_validator_1.body)("symptomsToday.*")
        .optional()
        .isIn(Object.values(daily_check_in_entity_1.Symptom))
        .withMessage(`Each symptom must be one of: ${Object.values(daily_check_in_entity_1.Symptom).join(", ")}`),
    // Step 4 (optional)
    (0, express_validator_1.body)("medicalReports")
        .optional()
        .isArray()
        .withMessage("medicalReports must be an array of strings"),
    (0, express_validator_1.body)("medicalReports.*").optional().isString(),
    (0, express_validator_1.body)("feelingAboutReport")
        .optional()
        .isString()
        .withMessage("feelingAboutReport must be a string"),
    // Step 5
    (0, express_validator_1.body)("lifestyleChecks")
        .optional()
        .isArray()
        .withMessage("lifestyleChecks must be an array"),
    (0, express_validator_1.body)("lifestyleChecks.*")
        .optional()
        .isIn(Object.values(daily_check_in_entity_1.LifestyleCheck))
        .withMessage(`Each lifestyle check must be one of: ${Object.values(daily_check_in_entity_1.LifestyleCheck).join(", ")}`),
    (0, express_validator_1.body)("anythingElse")
        .optional()
        .isString()
        .withMessage("anythingElse must be a string"),
];
exports.updateDailyCheckInValidator = [
    (0, express_validator_1.body)("hoursSlept").optional().isFloat({ min: 0, max: 24 }),
    (0, express_validator_1.body)("stressLevel").optional().isInt({ min: 1, max: 10 }),
    (0, express_validator_1.body)("currentMood").optional().isInt({ min: 1, max: 10 }),
    (0, express_validator_1.body)("dailyActivityMeasure").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("numOfWaterGlasses").optional().isInt({ min: 0 }),
    (0, express_validator_1.body)("currentHealthStatus")
        .optional()
        .isIn(Object.values(daily_check_in_entity_1.CurrentHealthStatus)),
    (0, express_validator_1.body)("symptomsToday").optional().isArray(),
    (0, express_validator_1.body)("symptomsToday.*").optional().isIn(Object.values(daily_check_in_entity_1.Symptom)),
    (0, express_validator_1.body)("medicalReports").optional().isArray(),
    (0, express_validator_1.body)("medicalReports.*").optional().isString(),
    (0, express_validator_1.body)("feelingAboutReport").optional().isString(),
    (0, express_validator_1.body)("lifestyleChecks").optional().isArray(),
    (0, express_validator_1.body)("lifestyleChecks.*").optional().isIn(Object.values(daily_check_in_entity_1.LifestyleCheck)),
    (0, express_validator_1.body)("anythingElse").optional().isString(),
];
