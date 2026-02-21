# Deploying a Node.js/Express/TypeScript Backend to Vercel

## Prerequisites

- Node.js project with TypeScript
- A Vercel account and the `vercel` CLI (or connect via GitHub)

---

## Project Structure Requirements

Vercel auto-detects TypeScript files inside an `api/` directory and builds them as serverless functions using `esbuild` via `@vercel/node`.

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

## Step 1 – Create the Serverless Entry Point

Create `api/index.ts`. Export a handler function — **never call `app.listen()`** here:

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
    return app(req, res);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error during initialization" });
  }
};
```

> **Why:** Vercel doesn't call `listen()`. It invokes your exported handler per request. Calling `process.exit()` or `app.listen()` will crash the function.

---

## Step 2 – Configure vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

This tells Vercel to send **all traffic** to the `api/index` function.

> **Do NOT use `builds` array** alongside `rewrites` — it conflicts with Vercel's internal routing and causes 404 errors.

---

## Step 3 – Remove TypeScript Path Aliases

`@vercel/node` uses `esbuild` which **does not resolve `tsconfig.json` path aliases** (e.g. `@/utils/...`).

❌ **Will fail on Vercel:**

```ts
import { AppError } from "@/utils/app-error.util";
```

✅ **Use relative imports instead:**

```ts
import { AppError } from "../../utils/app-error.util";
```

Also remove `baseUrl` and `paths` from `tsconfig.json`:

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
  }
}
```

---

## Step 4 – Handle Database Connections for Serverless

Serverless functions are stateless and spin up/down constantly. Cache the DB connection to avoid pool exhaustion:

```ts
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return; // Reuse existing connection
  }
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
};
```

> **Also important:** Never use `process.exit(1)` in your DB connection logic. Use `throw error` instead — `process.exit()` terminates the shared Node.js runtime and crashes the Vercel function immediately.

---

## Step 5 – Set Environment Variables

In the Vercel dashboard: **Project → Settings → Environment Variables**

Add all variables from your `.env` file. At minimum:

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

## Step 6 – Deploy

```bash
git add .
git commit -m "Add Vercel serverless configuration"
git push
```

Vercel auto-deploys on every push to the connected branch (usually `main`).

---

## Common Errors & Fixes

| Error                              | Cause                                         | Fix                                                   |
| ---------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `Cannot find module '@/...'`       | esbuild doesn't resolve tsconfig path aliases | Use relative imports only                             |
| `504: FUNCTION_INVOCATION_FAILED`  | `process.exit(1)` called at startup           | Replace with `throw error`                            |
| `404: NOT_FOUND` (Vercel page)     | `builds` + `routes` conflict                  | Use only `rewrites` in `vercel.json`                  |
| App starts but crashes immediately | `app.listen()` called in serverless entry     | Remove `listen()` from entry; only export the handler |
| DB connection hangs                | New connection created per invocation         | Cache connection with `readyState` guard              |
