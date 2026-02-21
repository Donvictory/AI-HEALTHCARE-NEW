# Full Architecture Bootstrap Guide

A comprehensive, production-ready guide for bootstrapping a new Modular Express + TypeScript Backend project. This guide covers the core architectural setup, Master Seeding, API caching with Redis, and LLM integrations via OpenRouter.

---

## 1. Project Initialization & Dependencies

### Create and Initialize the Project

```bash
mkdir my-new-api && cd my-new-api
npm init -y
npx tsc --init
```

### Install Dependencies

**Runtime Dependencies:**

```bash
npm install express mongoose dotenv cors bcrypt jsonwebtoken ms express-validator swagger-jsdoc swagger-ui-express openai redis
```

**Development Dependencies:**

```bash
npm install -D typescript ts-node-dev tsconfig-paths @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/ms @types/swagger-jsdoc @types/swagger-ui-express @types/redis @faker-js/faker
```

---

## 2. Environment Variables & App Configuration (`src/config/app.config.ts`)

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/my_new_app

# JWT configuration
ACCESS_SECRET=your-access-secret-here
REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Super Admin config
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=admin123

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AI configuration
AI_DEFAULT_PROVIDER=openrouter
OPEN_ROUTE_API_KEY=your_openrouter_api_key_here
```

Centralize variables inside `src/config/app.config.ts`:

```typescript
const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  debug: process.env.APP_DEBUG === "true",
  db: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/my_new_app",
  },
  jwt: {
    accessSecret: process.env.ACCESS_SECRET || "access-secret-key-123",
    refreshSecret: process.env.REFRESH_SECRET || "refresh-secret-key-123",
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "1h",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || "admin@example.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "admin123",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  ai: {
    openRouteApiKey: process.env.OPEN_ROUTE_API_KEY,
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || "openrouter",
  },
};

export default config;
```

---

## 3. Core Architecture Setup

Use a **Modular Repository Pattern**. A typical module includes:

1. **Entity (`<module>.entity.ts`)**: Pure TypeScript interfaces and enums.
2. **DTO (`<module>.dto.ts`)**: Data transfer objects for validation logic.
3. **Model (`<module>.model.ts`)**: Mongoose schema and model.
4. **Service (`<module>.service.ts`)**: Business logic, delegating database access to a generic `MongooseRepository`.
5. **Controller (`<module>.controller.ts`)**: HTTP handlers delegating logic to the Service.
6. **Validator (`<module>.validator.ts`)**: Express-validator chains.
7. **Route (`<module>.route.ts`)**: Express router wiring controller, validators, and auth middlewares.

---

## 4. API Caching Setup using Redis

Implement Redis for API response caching to significantly improve performance for read-heavy operations.

### Initialize Redis Client (`src/config/redis.config.ts`)

```typescript
import { createClient } from "redis";
import appConfig from "./app.config";

export const redisClient = createClient({
  url: appConfig.redis.url,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
```

### Redis Caching Middleware (`src/middlewares/cache.middleware.ts`)

Create a flexible caching middleware that can run on any route:

```typescript
import { Request, Response, NextFunction } from "express";
import { redisClient } from "@/config/redis.config";

export const cacheApi = (durationInSeconds: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    // Cache key incorporates the URL and query parameters
    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        return res.status(200).json(JSON.parse(cachedResponse));
      } else {
        // Intercept res.json to cache the response body before sending it
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
          return originalJson(body);
        };
        next();
      }
    } catch (error) {
      console.error("Redis Cache Error:", error);
      next(); // Fail gracefully if Redis is down
    }
  };
};
```

**Usage inside a Route file:**

```typescript
import { cacheApi } from "@/middlewares/cache.middleware";

// Cache for 5 minutes
router.get(
  "/",
  restrictTo(UserRole.ADMIN),
  cacheApi(300),
  controller.getAll.bind(controller),
);
```

Ensure Redis is connected on startup inside `server.ts` or `app.ts` (`await connectRedis()`).

---

## 5. Setting up the LLM Module with OpenRouter

To integrate OpenRouter LLMs, use the standard OpenAI module redirected to OpenRouter's URL.

### AI Provider Setup (`src/modules/ai/providers/openrouter.provider.ts`)

```typescript
import OpenAI from "openai";
import { IAIProvider } from "../ai.provider"; // Define your interface
import appConfig from "@/config/app.config";
import { AppError } from "@/utils/app-error.util";

export class OpenRouterProvider implements IAIProvider {
  private openai: OpenAI;

  constructor() {
    if (!appConfig.ai.openRouteApiKey)
      throw new AppError("OpenRouter API key is not configured", 500);

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: appConfig.ai.openRouteApiKey,
    });
  }

  async normalize(input: string, structure: any): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001", // Or any OpenRouter model
        messages: [
          {
            role: "system",
            content: `Normalize the input into a structured JSON matching: ${JSON.stringify(structure)}. Return ONLY valid JSON.`,
          },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" }, // Ensures valid JSON output
      });

      const result = response.choices[0].message.content;
      if (!result)
        throw new AppError("Failed to get response from OpenRouter", 500);

      return JSON.parse(result);
    } catch (error: any) {
      console.error("OpenRouter Error:", error);
      throw new AppError(
        `AI Processing failed: ${error.message}`,
        error.status || 500,
      );
    }
  }
}
```

### AI Service Component (`src/modules/ai/ai.service.ts`)

```typescript
import { IAIProvider } from "./ai.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import appConfig from "@/config/app.config";
import { AppError } from "@/utils/app-error.util";

export class AIService {
  private providers: Map<string, IAIProvider> = new Map();
  private cache: Map<string, any> = new Map();

  constructor() {
    this.providers.set("openrouter", new OpenRouterProvider());
  }

  async normalize(
    input: string,
    structure: any,
    providerName: string = "openrouter",
  ): Promise<any> {
    const cacheKey = `${providerName}:${input}:${JSON.stringify(structure)}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const provider = this.providers.get(providerName);
    if (!provider) throw new AppError(`AI Provider not found`, 404);

    const result = await provider.normalize(input, structure);
    this.cache.set(cacheKey, result);
    return result;
  }
}
```

---

## 6. Centralized Seeding Architecture

Maintain reference data and system dependencies using an orchestrator script.

1. `src/scripts/seed.ts` (Master Orchestrator)
2. `src/scripts/seeding/*.seeder.ts` (Independent Seeder scripts)

### Single Seeder Pattern (`src/scripts/seeding/users.seeder.ts`)

```typescript
import { faker } from "@faker-js/faker";
import { MongooseRepository } from "@/utils/crud.util";
import { IUser } from "@/modules/user/models/user.model";

// Seeders accept a generic repository, decoupled from the framework
export const generateUsers = async (
  count: number,
  repo: MongooseRepository<IUser>,
  hashedPassword: string,
) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await repo.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: hashedPassword,
      role: "EMPLOYEE",
    });
    users.push(user);
  }
  return users;
};
```

### Master Orchestrator (`src/scripts/seed.ts`)

```typescript
import "dotenv/config";
import connectToDatabase from "../config/db.config";
import { MongooseRepository } from "../utils/crud.util";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../modules/user/models/user.model";
import { generateUsers } from "./seeding/users.seeder";
// Import other models and seeders

const seedData = async () => {
  try {
    await connectToDatabase();
    console.log("Database connected for seeding.");

    const userRepo = new MongooseRepository<IUser>(UserModel);

    // 1. Clear Data
    await userRepo.deleteMany({});

    // 2. Generate Data
    const hashedPw = await bcrypt.hash("password123", 10);
    console.log("Generating users...");
    await generateUsers(20, userRepo, hashedPw);

    // Add additional dependent seeders sequentially...

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
```

Execute with: `npm run seedData`

---

## 7. Starting Up

Add the `redisClient.connect()` logic alongside standard app boot process:

```typescript
import app from "./app";
import { connectRedis } from "./config/redis.config";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis(); // Initialize caching engine first
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
```
