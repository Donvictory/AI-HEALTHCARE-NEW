import mongoose from "mongoose";
import { appConfig } from "./app.config";

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const options: mongoose.ConnectOptions = {};
    if (appConfig.db.username && appConfig.db.password) {
      options.user = appConfig.db.username;
      options.pass = appConfig.db.password;
    }

    await mongoose.connect(appConfig.db.url, options);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
