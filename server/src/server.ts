import app from "./app";
import { connectRedis } from "./config/redis.config";
import { appConfig } from "./config/app.config";
import connectToDatabase from "./config/db.config";

const PORT = appConfig.port;

const startServer = async () => {
  try {
    await connectToDatabase();
    // await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running in ${appConfig.env} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
