import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@/utils/app-error.util";
import { appConfig } from "@/config/app.config";
import UserModel from "@/modules/user/user.model";
import { UserRole } from "@/modules/user/user.entity";

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    const decoded = jwt.verify(token, appConfig.jwt.accessSecret) as JwtPayload;

    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401,
        ),
      );
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token!", 401));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

// Extend Express Request object to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
