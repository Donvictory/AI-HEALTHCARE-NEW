import app from "./app";
import appConfig from "./config/app.config";
import connectToDatabase from "./config/db.config";
import { connectRedis } from "./config/redis.config";

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectToDatabase();

    // 2. Connect to Redis (Caching Engine)
    await connectRedis();

    // 3. Start Server
    app.listen(appConfig.port, () => {
      console.log(
        `Server running in ${appConfig.env} mode on port ${appConfig.port}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
