import { body } from "express-validator";

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
