import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const userService = new UserService();

export class UserController {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user, accessToken, refreshToken } =
        await userService.registerUser(req.body);
      user.password = undefined;
      sendSuccess(
        res,
        { accessToken, refreshToken, user },
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
      sendSuccess(
        res,
        { accessToken, refreshToken, user },
        "Login successful",
        200,
      );
    },
  );

  refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      const { accessToken } =
        await userService.refreshAccessToken(refreshToken);
      sendSuccess(res, { accessToken }, "Access token refreshed", 200);
    },
  );

  logout = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      // Client should discard tokens. Stateless JWT — no server-side revocation for now.
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
