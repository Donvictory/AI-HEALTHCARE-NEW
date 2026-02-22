import cron from "node-cron";
import { resetDailyChecks } from "../services/daily-reset.service";

export const initCronJobs = () => {
  // schedule resetDailyChecks at 00:00 every day
  cron.schedule("0 0 * * *", async () => {
    await resetDailyChecks();
  });

  console.log("Cron jobs initialized.");
};
