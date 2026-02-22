import app from "./app";
import { appConfig } from "./config/app.config";
import connectToDatabase from "./config/db.config";

const PORT = appConfig.port;

// ─── Local Development ───────────────────────────────────────────────────────
// Only start the HTTP server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    try {
      await connectToDatabase();
      // await connectRedis();

      const { initCronJobs } = await import("./cron/cron");
      initCronJobs();

      app.listen(PORT, () => {
        console.log(`Server running in ${appConfig.env} mode on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
}

// ─── Vercel Serverless Handler ───────────────────────────────────────────────
// Vercel detects and calls this exported function for each request.
// express.json() in app.ts handles body parsing normally — no manipulation needed.
let isDbConnected = false;

const handler = async (req: any, res: any) => {
  if (!isDbConnected) {
    await connectToDatabase();
    isDbConnected = true;
  }
  return app(req, res);
};

export default handler;
