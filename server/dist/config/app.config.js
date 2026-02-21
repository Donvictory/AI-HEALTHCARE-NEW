"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    debug: process.env.APP_DEBUG === "true",
    db: {
        url: process.env.MONGODB_URI || "mongodb://localhost:27017/ai_healthcare_db",
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
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
        openRouteApiKey: process.env.OPEN_ROUTER_API_KEY,
        defaultProvider: process.env.AI_DEFAULT_PROVIDER || "openrouter",
    },
};
exports.default = config;
