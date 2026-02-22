import { body } from "express-validator";
import {
  CurrentHealthStatus,
  Symptom,
  LifestyleCheck,
} from "./daily-check-in.entity";

// ─── Full check-in validator ──────────────────────────────────────────────────

export const createDailyCheckInValidator = [
  // Step 1
  body("hoursSlept")
    .isFloat({ min: 0, max: 24 })
    .withMessage("hoursSlept must be between 0 and 24"),
  body("stressLevel")
    .isInt({ min: 1, max: 10 })
    .withMessage("stressLevel must be between 1 and 10"),
  body("currentMood")
    .isInt({ min: 1, max: 10 })
    .withMessage("currentMood must be between 1 and 10"),

  // Step 2
  body("dailyActivityMeasure")
    .isFloat({ min: 0 })
    .withMessage("dailyActivityMeasure must be a positive number (minutes)"),
  body("numOfWaterGlasses")
    .isInt({ min: 0 })
    .withMessage("numOfWaterGlasses must be a non-negative integer"),

  // Step 3
  body("currentHealthStatus")
    .isIn(Object.values(CurrentHealthStatus))
    .withMessage(
      `currentHealthStatus must be one of: ${Object.values(CurrentHealthStatus).join(", ")}`,
    ),
  body("symptomsToday")
    .optional()
    .isArray()
    .withMessage("symptomsToday must be an array"),
  body("symptomsToday.*")
    .optional()
    .isIn(Object.values(Symptom))
    .withMessage(
      `Each symptom must be one of: ${Object.values(Symptom).join(", ")}`,
    ),

  // Step 4 (optional)
  body("medicalReports")
    .optional()
    .isArray()
    .withMessage("medicalReports must be an array of strings"),
  body("medicalReports.*").optional().isString(),
  body("feelingAboutReport")
    .optional()
    .isString()
    .withMessage("feelingAboutReport must be a string"),

  // Step 5
  body("lifestyleChecks")
    .optional()
    .isArray()
    .withMessage("lifestyleChecks must be an array"),
  body("lifestyleChecks.*")
    .optional()
    .isIn(Object.values(LifestyleCheck))
    .withMessage(
      `Each lifestyle check must be one of: ${Object.values(LifestyleCheck).join(", ")}`,
    ),
  body("anythingElse")
    .optional()
    .isString()
    .withMessage("anythingElse must be a string"),
];

export const updateDailyCheckInValidator = [
  body("hoursSlept").optional().isFloat({ min: 0, max: 24 }),
  body("stressLevel").optional().isInt({ min: 1, max: 10 }),
  body("currentMood").optional().isInt({ min: 1, max: 10 }),
  body("dailyActivityMeasure").optional().isFloat({ min: 0 }),
  body("numOfWaterGlasses").optional().isInt({ min: 0 }),
  body("currentHealthStatus")
    .optional()
    .isIn(Object.values(CurrentHealthStatus)),
  body("symptomsToday").optional().isArray(),
  body("symptomsToday.*").optional().isIn(Object.values(Symptom)),
  body("medicalReports").optional().isArray(),
  body("medicalReports.*").optional().isString(),
  body("feelingAboutReport").optional().isString(),
  body("lifestyleChecks").optional().isArray(),
  body("lifestyleChecks.*").optional().isIn(Object.values(LifestyleCheck)),
  body("anythingElse").optional().isString(),
];
