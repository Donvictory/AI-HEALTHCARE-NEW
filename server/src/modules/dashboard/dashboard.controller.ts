import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const service = new DashboardService();

export class DashboardController {
  getMetrics = catchAsync(async (req: Request, res: Response) => {
    const metrics = await service.getDashboardMetrics(req.user.id);
    sendSuccess(res, metrics, "Dashboard metrics retrieved");
  });
}
