import { Request, Response, NextFunction } from "express";
import { DoctorService } from "./doctor.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";
import { AppError } from "../../utils/app-error.util";
import UserModel from "../user/user.model";
import { Specialty } from "./doctor.entity";

const service = new DoctorService();

export class DoctorController {
  // ─── Public / User ────────────────────────────────────────────────────────

  /**
   * GET /api/v1/doctors/nearby
   * Returns available doctors in the authenticated user's city, then falls
   * back to state-level if no city matches are found.
   */
  findNearby = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Re-fetch user to get latest state/city from their profile
      const user = await UserModel.findById(req.user.id).lean();
      if (!user) return next(new AppError("User not found", 404));
      if (!user.state)
        return next(
          new AppError(
            "Please update your profile with your state to find nearby doctors.",
            400,
          ),
        );

      const specialty = req.query.specialty as Specialty | undefined;
      const doctors = await service.findNearby(
        user.state,
        user.city,
        specialty,
      );

      sendSuccess(
        res,
        {
          results: doctors.length,
          location: { state: user.state, city: user.city },
          doctors,
        },
        "Nearby doctors retrieved",
        200,
      );
    },
  );

  /**
   * GET /api/v1/doctors — all doctors with optional ?state &city &specialty &isAvailable
   */
  getAll = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { state, city, specialty, isAvailable } = req.query as any;
      const doctors = await service.getAll({
        state,
        city,
        specialty,
        isAvailable,
      });
      sendSuccess(
        res,
        { results: doctors.length, doctors },
        "Doctors retrieved",
        200,
      );
    },
  );

  getById = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const doctor = await service.getById(req.params.id as string);
      sendSuccess(res, { doctor }, "Doctor retrieved", 200);
    },
  );

  // ─── Admin ────────────────────────────────────────────────────────────────

  create = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const doctor = await service.create(req.body);
      sendSuccess(res, { doctor }, "Doctor created successfully", 201);
    },
  );

  update = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const doctor = await service.update(req.params.id as string, req.body);
      sendSuccess(res, { doctor }, "Doctor updated successfully", 200);
    },
  );

  delete = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      await service.delete(req.params.id as string);
      sendSuccess(res, null, "Doctor deleted successfully", 200);
    },
  );
}
