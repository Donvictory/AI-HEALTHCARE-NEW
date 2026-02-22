import { body } from "express-validator";
import { Gender, HealthCondition, FamilyHealthHistory } from "./user.entity";

export const createUserValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidator = [
  body("age").optional().isNumeric().withMessage("Age must be a number"),
  body("gender")
    .optional()
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),
  body("height").optional().isNumeric().withMessage("Height must be a number"),
  body("weight").optional().isNumeric().withMessage("Weight must be a number"),
  body("state").optional().isString().withMessage("State must be a string"),
  body("city").optional().isString().withMessage("City must be a string"),
  body("phoneNumber")
    .optional()
    .isString()
    .withMessage("Phone number must be a string"),
  body("healthConditions")
    .optional()
    .isArray()
    .withMessage("Health conditions must be an array"),
  body("healthConditions.*")
    .isIn(Object.values(HealthCondition))
    .withMessage("Invalid health condition"),
  body("familyHealthHistory")
    .optional()
    .isArray()
    .withMessage("Family health history must be an array"),
  body("familyHealthHistory.*")
    .isIn(Object.values(FamilyHealthHistory))
    .withMessage("Invalid family health history"),
  body("hasCompletedDailyChecks").optional().isBoolean(),
  body("currentDailyCheckStep").optional().isNumeric(),
  body("isFirstLogin").optional().isBoolean(),
];

export const onboardUserValidator = [
  body("age").optional().isNumeric().withMessage("Age must be a number"),
  body("gender")
    .optional()
    .isIn(Object.values(Gender))
    .withMessage("Invalid gender"),
  body("height").optional().isNumeric().withMessage("Height must be a number"),
  body("weight").optional().isNumeric().withMessage("Weight must be a number"),
  body("state").optional().isString().withMessage("State must be a string"),
  body("city").optional().isString().withMessage("City must be a string"),
  body("phoneNumber")
    .optional()
    .isString()
    .withMessage("Phone number must be a string"),
  body("healthConditions")
    .optional()
    .isArray()
    .withMessage("Health conditions must be an array"),
  body("healthConditions.*")
    .isIn(Object.values(HealthCondition))
    .withMessage("Invalid health condition"),
  body("familyHealthHistory")
    .optional()
    .isArray()
    .withMessage("Family health history must be an array"),
  body("familyHealthHistory.*")
    .isIn(Object.values(FamilyHealthHistory))
    .withMessage("Invalid family health history"),
];

export const refreshTokenValidator = [
  // Refresh token may arrive either as an httpOnly cookie (primary) or in the
  // request body (legacy / non-browser clients). Make the body field optional.
  body("refreshToken").optional().isString(),
];
