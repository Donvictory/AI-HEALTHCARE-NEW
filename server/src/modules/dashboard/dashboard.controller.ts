import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const service = new DashboardService();

export class DashboardController {
  getMetrics = catchAsync(async (req: Request, res: Response) => {
    const metrics = await service.getDashboardMetrics((req as any).user.id);
    sendSuccess(res, metrics, "Dashboard metrics retrieved");
  });

  exportFHIR = catchAsync(async (req: Request, res: Response) => {
    const data = await service.getFHIRData((req as any).user.id);
    sendSuccess(res, data, "FHIR data exported successfully");
  });

  getSBARReport = catchAsync(async (req: Request, res: Response) => {
    const data = await service.getSBARSummary((req as any).user.id);
    sendSuccess(res, data, "SBAR report generated successfully");
  });
}
