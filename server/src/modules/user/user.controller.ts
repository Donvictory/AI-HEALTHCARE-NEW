import { Request, Response, NextFunction } from "express";
import { UserService } from "@/modules/user/user.service";
import { catchAsync } from "@/utils/catch-async.util";
import { sendSuccess } from "@/utils/api-response.util";

const userService = new UserService();

export class UserController {
  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // NOTE: Removed validationResult check as it is now handled by validateRequest middleware

      const { user, token } = await userService.registerUser(req.body);

      // Remove password from output
      user.password = undefined;

      sendSuccess(res, { token, user }, "User registered successfully", 201);
    },
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // NOTE: Removed validationResult check here too

      const { email, password } = req.body;
      const { user, token } = await userService.loginUser(email, password);

      user.password = undefined;

      sendSuccess(res, { token, user }, "Login successful", 200);
    },
  );

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
        "User profile updated successfully",
        200,
      );
    },
  );
}
