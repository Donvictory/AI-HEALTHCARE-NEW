import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const userService = new UserService();

// 7 days in milliseconds
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

export class UserController {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user, accessToken, refreshToken } =
        await userService.registerUser(req.body);
      user.password = undefined;
      setRefreshTokenCookie(res, refreshToken);
      sendSuccess(
        res,
        { accessToken, user },
        "User registered successfully",
        201,
      );
    },
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user, accessToken, refreshToken } = await userService.loginUser(
        req.body,
      );
      user.password = undefined;
      setRefreshTokenCookie(res, refreshToken);
      sendSuccess(res, { accessToken, user }, "Login successful", 200);
    },
  );

  refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Read from httpOnly cookie (preferred) or fallback to body
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return next(
          new (await import("../../utils/app-error.util")).AppError(
            "Refresh token not found",
            401,
          ),
        );
      }
      const { accessToken } = await userService.refreshAccessToken(token);
      sendSuccess(res, { accessToken }, "Access token refreshed", 200);
    },
  );

  logout = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      sendSuccess(res, null, "Logged out successfully", 200);
    },
  );

  // ─── Profile ───────────────────────────────────────────────────────────────

  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.getUserById(req.user.id);
      sendSuccess(res, { user }, "User profile retrieved successfully", 200);
    },
  );

  getProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = await userService.getEnrichedProfile(req.user.id);
      sendSuccess(res, data, "Enriched profile retrieved successfully", 200);
    },
  );

  updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const allowedUpdates = { ...req.body };
      delete allowedUpdates.password;
      delete allowedUpdates.role;
      delete allowedUpdates.email;

      const updatedUser = await userService.updateUserById(
        req.user.id,
        allowedUpdates,
      );
      sendSuccess(
        res,
        { user: updatedUser },
        "Profile updated successfully",
        200,
      );
    },
  );

  deleteMe = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      await userService.deleteUserById(req.user.id);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      sendSuccess(res, null, "Account deleted successfully", 204);
    },
  );

  // ─── Admin ─────────────────────────────────────────────────────────────────

  getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await userService.getAllUsers();
      sendSuccess(
        res,
        { results: users.length, users },
        "Users retrieved successfully",
        200,
      );
    },
  );
}
