import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.util";

/**
 * Restriction: Only allow daily check-ins after 6 PM (18:00) server time.
 */
export const restrictToCheckInWindow = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentHour = new Date().getHours();

  // 18:00 is 6 PM
  if (currentHour < 18 && process.env.NODE_ENV !== "development") {
    return next(
      new AppError(
        "Daily check-in is only available at the end of the day (after 6 PM).",
        400,
      ),
    );
  }

  next();
};
