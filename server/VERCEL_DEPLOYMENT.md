# Deploying a Node.js/Express/TypeScript Backend to Vercel

## Prerequisites

- Node.js project with TypeScript
- A Vercel account connected to your GitHub repo

---

## Project Structure

Vercel auto-detects TypeScript files inside an `api/` directory and builds them as serverless functions.

```
server/
├── api/
│   └── index.ts      ← Vercel serverless entry point
├── src/
│   └── app.ts        ← Express app (no app.listen)
├── vercel.json
└── tsconfig.json
```

---

## Step 1 – Create the Serverless Entry Point (`api/index.ts`)

**Never call `app.listen()` here.** Export a handler function instead.  
Also handle Vercel's pre-read body — it can arrive as a Buffer/string before Express sees it:

```ts
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

    // Vercel may pre-read the body as a Buffer/string.
    // Parse it to JSON so express.json() works correctly.
    if (req.body && typeof req.body !== "object") {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch {
        // Not JSON, leave as-is
      }
    }

    return app(req, res);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
```

---

## Step 2 – Configure `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

> **Do NOT use `builds` array** alongside `rewrites` — they conflict and cause 404 errors.

---

## Step 3 – Remove TypeScript Path Aliases

`@vercel/node` uses `esbuild` which **does not resolve `tsconfig.json` path aliases**.

❌ Fails on Vercel:

```ts
import { AppError } from "@/utils/app-error.util";
```

✅ Use relative imports:

```ts
import { AppError } from "../../utils/app-error.util";
```

Remove `baseUrl` and `paths` from `tsconfig.json`:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "api/**/*"]
}
```

---

## Step 4 – Database Connection Caching

Cache the Mongoose connection to avoid pool exhaustion across serverless invocations:

```ts
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
};
```

> **Critical:** Never use `process.exit(1)` — use `throw error` instead. `process.exit()` terminates the shared Node.js runtime and crashes the Vercel function.

---

## Step 5 – CORS Configuration

Vercel can silently drop CORS headers on `OPTIONS` preflight requests. Fix with an explicit origin list and a preflight handler:

```ts
const ALLOWED_ORIGINS = [
  "https://your-frontend.vercel.app",
  "http://localhost:8000", // Include API port for local Swagger
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Explicitly handle OPTIONS preflight
app.options("*", cors());
```

> If using cookies (`httpOnly` refresh tokens), the frontend must use `credentials: "include"` on all fetch calls.

---

## Step 6 – Swagger UI

`swagger-ui-express` serves static files from `node_modules/swagger-ui-dist/` — this does **not** work on Vercel serverless.

Two required changes:

**a) Use a CDN-hosted Swagger UI:**

```ts
app.get("/api-docs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerSpec)},
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      });
    </script>
  </body>
</html>`);
});
```

**b) Define the OpenAPI spec inline (not via `swagger-jsdoc` file globs):**

`swagger-jsdoc` scans `.ts` source files at runtime — those files don't exist on Vercel. Define the spec as a plain TypeScript object instead:

```ts
const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: { title: "My API", version: "1.0.0" },
  paths: { ... }
};
export default swaggerSpec;
```

---

## Step 7 – Set Environment Variables

In Vercel: **Project → Settings → Environment Variables**

```
MONGODB_URI
ACCESS_SECRET
REFRESH_SECRET
NODE_ENV=production
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## Common Errors & Fixes

| Error                            | Cause                                         | Fix                                        |
| -------------------------------- | --------------------------------------------- | ------------------------------------------ |
| `Cannot find module '@/...'`     | esbuild doesn't resolve tsconfig path aliases | Use relative imports only                  |
| `FUNCTION_INVOCATION_FAILED`     | `process.exit(1)` called at startup           | Replace with `throw error`                 |
| `404: NOT_FOUND` (Vercel page)   | `builds` + `rewrites` conflict                | Use only `rewrites` in `vercel.json`       |
| App crashes on startup           | `app.listen()` in serverless entry            | Remove `listen()`; only export the handler |
| DB connection pool exhausted     | New connection per invocation                 | Cache with `readyState` guard              |
| `SwaggerUIBundle is not defined` | `swagger-ui-express` can't serve static files | Use CDN-hosted Swagger UI HTML             |
| Swagger spec blank               | `swagger-jsdoc` glob finds no `.ts` files     | Use inline OpenAPI spec object             |
| CORS preflight blocked           | Vercel drops OPTIONS before Express           | Add `app.options("*", cors())` explicitly  |
| `req.body` empty on Vercel       | Body pre-read as Buffer before Express        | Parse Buffer to JSON in `api/index.ts`     |
