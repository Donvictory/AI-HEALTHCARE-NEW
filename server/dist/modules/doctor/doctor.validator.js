"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDoctorsQueryValidator = exports.updateDoctorValidator = exports.createDoctorValidator = void 0;
const express_validator_1 = require("express-validator");
const doctor_entity_1 = require("./doctor.entity");
const specialtyValues = Object.values(doctor_entity_1.Specialty);
// ─── Create ───────────────────────────────────────────────────────────────────
exports.createDoctorValidator = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Doctor name is required"),
    (0, express_validator_1.body)("specialty")
        .isIn(specialtyValues)
        .withMessage(`specialty must be one of: ${specialtyValues.join(", ")}`),
    (0, express_validator_1.body)("hospitalOrClinic")
        .notEmpty()
        .withMessage("Hospital or clinic name is required"),
    (0, express_validator_1.body)("state").notEmpty().withMessage("State is required"),
    (0, express_validator_1.body)("city").notEmpty().withMessage("City is required"),
    (0, express_validator_1.body)("email").optional().isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("phone").optional().isString(),
    (0, express_validator_1.body)("bio").optional().isString(),
    (0, express_validator_1.body)("yearsOfExperience").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("consultationFee").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("rating").optional().isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean(),
];
// ─── Update ───────────────────────────────────────────────────────────────────
exports.updateDoctorValidator = [
    (0, express_validator_1.body)("name").optional().notEmpty(),
    (0, express_validator_1.body)("specialty").optional().isIn(specialtyValues),
    (0, express_validator_1.body)("hospitalOrClinic").optional().notEmpty(),
    (0, express_validator_1.body)("state").optional().notEmpty(),
    (0, express_validator_1.body)("city").optional().notEmpty(),
    (0, express_validator_1.body)("email").optional().isEmail(),
    (0, express_validator_1.body)("phone").optional().isString(),
    (0, express_validator_1.body)("bio").optional().isString(),
    (0, express_validator_1.body)("yearsOfExperience").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("consultationFee").optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)("rating").optional().isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean(),
];
// ─── Query ────────────────────────────────────────────────────────────────────
exports.findDoctorsQueryValidator = [
    (0, express_validator_1.query)("state").optional().isString(),
    (0, express_validator_1.query)("city").optional().isString(),
    (0, express_validator_1.query)("specialty").optional().isIn(specialtyValues),
    (0, express_validator_1.query)("isAvailable").optional().isBoolean(),
];
