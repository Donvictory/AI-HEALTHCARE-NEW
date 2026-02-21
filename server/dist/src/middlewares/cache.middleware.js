"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheApi = void 0;
const redis_config_1 = require("../config/redis.config");
const cacheApi = (durationInSeconds = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET")
            return next();
        // Cache key incorporates the URL and query parameters
        const key = `cache:${req.originalUrl}`;
        try {
            const cachedResponse = await redis_config_1.redisClient.get(key);
            if (cachedResponse) {
                return res.status(200).json(JSON.parse(cachedResponse));
            }
            else {
                // Intercept res.json to cache the response body before sending it
                const originalJson = res.json.bind(res);
                res.json = (body) => {
                    redis_config_1.redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
                    return originalJson(body);
                };
                next();
            }
        }
        catch (error) {
            console.error("Redis Cache Error:", error);
            next(); // Fail gracefully if Redis is down
        }
    };
};
exports.cacheApi = cacheApi;
