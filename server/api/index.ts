// Register tsconfig path aliases for Vercel's runtime
import { register } from "tsconfig-paths";
import { join } from "path";

// Read tsconfig and register path mappings
register({
  baseUrl: join(__dirname, ".."),
  paths: { "@/*": ["src/*"] },
});

import app from "../src/app";
import connectToDatabase from "../src/config/db.config";

let isDbConnected = false;

const initializeServices = async () => {
  if (!isDbConnected) {
    try {
      await connectToDatabase();
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
    return app(req, res);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error during initialization" });
  }
};
