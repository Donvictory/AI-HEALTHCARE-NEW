import app from "../src/app";
import connectToDatabase from "../src/config/db.config";

let isDbConnected = false;

const initializeServices = async () => {
  if (!isDbConnected) {
    await connectToDatabase();
    isDbConnected = true;
  }
};

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
