import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catch-async.util";
import { validationResult } from "express-validator";
import { AppError } from "../../utils/app-error.util";

const userService = new UserService();

export class UserController {
  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { user, token } = await userService.registerUser(req.body);

      // Remove password from output
      user.password = undefined;

      res.status(201).json({
        status: "success",
        token,
        data: { user },
      });
    },
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const { email, password } = req.body;
      const { user, token } = await userService.loginUser(email, password);

      user.password = undefined;

      res.status(200).json({
        status: "success",
        token,
        data: { user },
      });
    },
  );

  getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await userService.getAllUsers();
      res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
      });
    },
  );

  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await userService.getUserById(req.user.id);
      res.status(200).json({
        status: "success",
        data: { user },
      });
    },
  );
}
