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
