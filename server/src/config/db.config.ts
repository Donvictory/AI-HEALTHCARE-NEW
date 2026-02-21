import mongoose from "mongoose";
import { appConfig } from "./app.config";

const connectToDatabase = async () => {
  try {
    const options: mongoose.ConnectOptions = {};
    if (appConfig.db.username && appConfig.db.password) {
      options.user = appConfig.db.username;
      options.pass = appConfig.db.password;
    }

    await mongoose.connect(appConfig.db.url, options);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
