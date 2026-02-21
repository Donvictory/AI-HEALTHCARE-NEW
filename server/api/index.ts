import app from "../src/app";
import connectToDatabase from "../src/config/db.config";

let isDbConnected = false;

const initializeServices = async () => {
  if (!isDbConnected) {
    await connectToDatabase();
    isDbConnected = true;
  }
};

/**
 * Read raw body from the request stream before Express consumes it.
 * Vercel serverless functions may or may not pre-parse the body.
 * Either way, we read it ourselves to guarantee req.body is set correctly.
 */
const readRawBody = (req: any): Promise<string> => {
  return new Promise((resolve) => {
    // Already pre-parsed by Vercel as an object
    if (req.body !== undefined && typeof req.body === "object") {
      return resolve("");
    }
    // Already pre-parsed as a string/Buffer
    if (req.body !== undefined) {
      return resolve(req.body.toString());
    }

    // Read from the raw stream
    let raw = "";
    req.on("data", (chunk: Buffer) => (raw += chunk.toString()));
    req.on("end", () => resolve(raw));
    req.on("error", () => resolve(""));
  });
};

export default async (req: any, res: any) => {
  try {
    await initializeServices();

    // Parse body from stream before Express touches it
    const rawBody = await readRawBody(req);

    if (rawBody) {
      try {
        req.body = JSON.parse(rawBody);
      } catch {
        req.body = rawBody;
      }
    } else if (req.body === undefined) {
      req.body = {};
    }

    // Mark body as already parsed so express.json() won't overwrite it
    req._body = true;

    return app(req, res);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
