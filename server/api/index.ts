import app from "../src/app";
import connectToDatabase from "../src/config/db.config";
import { connectRedis } from "../src/config/redis.config";

let isDbConnected = false;

// Connect to external services concurrently (Cold Start optimization)
const initializeServices = async () => {
  if (!isDbConnected) {
    try {
      await Promise.all([connectToDatabase(), connectRedis()]);
      isDbConnected = true;
      console.log(
        "Services initialized successfully in Serverless environment",
      );
    } catch (error) {
      console.error("Failed to initialize services:", error);
      throw error;
    }
  }
};

// Vercel serverless request handler
export default async (req: any, res: any) => {
  try {
    await initializeServices();
    // Expose the raw Express `app` instance directly to Vercel
    return app(req, res);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error during initialization" });
  }
};
