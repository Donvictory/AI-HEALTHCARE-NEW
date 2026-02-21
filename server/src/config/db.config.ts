import mongoose from "mongoose";
import appConfig from "./app.config";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(appConfig.db.url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
