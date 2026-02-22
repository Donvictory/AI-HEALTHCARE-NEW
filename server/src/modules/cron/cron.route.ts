import { Router, Request, Response } from "express";
import { resetDailyChecks } from "../../services/daily-reset.service";
import { sendSuccess, sendError } from "../../utils/api-response.util";

const router = Router();

/**
 * GET /api/v1/cron/daily-reset
 * Triggered by Vercel Cron or manual admin call.
 * Securing with a Bearer Token or secret header recommended in production.
 */
router.get("/daily-reset", async (req: Request, res: Response) => {
  try {
    // Basic security check (optional, but good for Vercel)
    const secret = req.headers["x-cron-secret"];
    if (
      process.env.NODE_ENV === "production" &&
      secret !== process.env.CRON_SECRET
    ) {
      return sendError(res, "Unauthorized cron trigger", 401);
    }

    const result = await resetDailyChecks();
    sendSuccess(res, result, "Daily reset triggered successfully");
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

export default router;
