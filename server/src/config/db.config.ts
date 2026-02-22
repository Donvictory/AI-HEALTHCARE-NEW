import mongoose from "mongoose";
import { appConfig } from "./app.config";

// Disable buffering so commands fail fast if DB is down
mongoose.set("bufferCommands", false);

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const connectionPromise = (async () => {
    try {
      const options: mongoose.ConnectOptions = {
        serverSelectionTimeoutMS: 2000, // 2 seconds
        connectTimeoutMS: 5000,
      };
      if (appConfig.db.username && appConfig.db.password) {
        options.user = appConfig.db.username;
        options.pass = appConfig.db.password;
      }

      await mongoose.connect(appConfig.db.url, options);
      isConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error(
        "MongoDB Connection Error (Will retry if needed):",
        (error as Error).message,
      );
    }
  })();

  // Do not await so the server can start listening even if DB is down
  if (process.env.NODE_ENV === "development") {
    console.warn("Starting server without waiting for MongoDB connection...");
  } else {
    await connectionPromise;
  }
};

export default connectToDatabase;
