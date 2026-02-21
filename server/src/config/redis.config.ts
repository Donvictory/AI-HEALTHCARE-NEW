import { createClient } from "redis";
import { appConfig } from "./app.config";

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
