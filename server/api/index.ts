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

    // Vercel may pre-read the body as a Buffer before passing to Express.
    // If req.body is already set by Vercel (as a Buffer or string), attach it
    // so Express's json() parser can re-use it.
    if (req.body && typeof req.body !== "object") {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch {
        // Not JSON, leave as-is
      }
    }

    return app(req, res);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error during initialization" });
  }
};
