import { body, query } from "express-validator";
import { Specialty } from "./doctor.entity";

const specialtyValues = Object.values(Specialty);

// ─── Create ───────────────────────────────────────────────────────────────────

export const createDoctorValidator = [
  body("name").notEmpty().withMessage("Doctor name is required"),
  body("specialty")
    .isIn(specialtyValues)
    .withMessage(`specialty must be one of: ${specialtyValues.join(", ")}`),
  body("hospitalOrClinic")
    .notEmpty()
    .withMessage("Hospital or clinic name is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("phone").optional().isString(),
  body("bio").optional().isString(),
  body("yearsOfExperience").optional().isFloat({ min: 0 }),
  body("consultationFee").optional().isFloat({ min: 0 }),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("isAvailable").optional().isBoolean(),
];

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateDoctorValidator = [
  body("name").optional().notEmpty(),
  body("specialty").optional().isIn(specialtyValues),
  body("hospitalOrClinic").optional().notEmpty(),
  body("state").optional().notEmpty(),
  body("city").optional().notEmpty(),
  body("email").optional().isEmail(),
  body("phone").optional().isString(),
  body("bio").optional().isString(),
  body("yearsOfExperience").optional().isFloat({ min: 0 }),
  body("consultationFee").optional().isFloat({ min: 0 }),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("isAvailable").optional().isBoolean(),
];

// ─── Query ────────────────────────────────────────────────────────────────────

export const findDoctorsQueryValidator = [
  query("state").optional().isString(),
  query("city").optional().isString(),
  query("specialty").optional().isIn(specialtyValues),
  query("isAvailable").optional().isBoolean(),
];
