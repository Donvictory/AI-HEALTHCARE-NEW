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

    // Vercel pre-reads the request body before Express sees it.
    // body-parser (used by express.json()) checks req._body to know if body
    // is already parsed. If it's not set, it tries to re-read the exhausted
    // stream and overwrites req.body with {}.
    if (req.body !== undefined) {
      // Body is already an object (pre-parsed by Vercel)
      if (typeof req.body === "object") {
        req._body = true; // Tell body-parser: skip, already done
      } else {
        // Body is a string or Buffer — parse it ourselves
        try {
          req.body = JSON.parse(req.body.toString());
          req._body = true;
        } catch {
          // Non-JSON body, leave as-is
        }
      }
    }

    return app(req, res);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
