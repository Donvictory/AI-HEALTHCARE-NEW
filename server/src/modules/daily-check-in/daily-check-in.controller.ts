import { Request, Response, NextFunction } from "express";
import { DailyCheckInService } from "./daily-check-in.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const service = new DailyCheckInService();

export class DailyCheckInController {
  create = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const checkIn = await service.create((req as any).user.id, req.body);
      sendSuccess(
        res,
        { checkIn },
        "Daily check-in submitted successfully",
        201,
      );
    },
  );

  getAll = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const checkIns = await service.getAll((req as any).user.id);
      sendSuccess(
        res,
        { results: checkIns.length, checkIns },
        "Daily check-ins retrieved",
        200,
      );
    },
  );

  getToday = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const checkIn = await service.getToday((req as any).user.id);
      if (!checkIn) {
        return sendSuccess(
          res,
          { checkIn: null },
          "No check-in found for today",
          200,
        );
      }
      sendSuccess(res, { checkIn }, "Today's check-in retrieved", 200);
    },
  );

  getById = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const checkIn = await service.getById(
        req.params.id as string,
        (req as any).user.id,
      );
      sendSuccess(res, { checkIn }, "Daily check-in retrieved", 200);
    },
  );

  update = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const checkIn = await service.update(
        req.params.id as string,
        (req as any).user.id,
        req.body,
      );
      sendSuccess(res, { checkIn }, "Daily check-in updated successfully", 200);
    },
  );

  delete = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      await service.delete(req.params.id as string, (req as any).user.id);
      sendSuccess(res, null, "Daily check-in deleted", 200);
    },
  );
}
