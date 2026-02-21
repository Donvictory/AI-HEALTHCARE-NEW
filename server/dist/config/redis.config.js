"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const app_config_1 = __importDefault(require("../config/app.config"));
exports.redisClient = (0, redis_1.createClient)({
    url: app_config_1.default.redis.url,
});
exports.redisClient.on("error", (err) => console.error("Redis Client Error:", err));
exports.redisClient.on("connect", () => console.log("Connected to Redis"));
const connectRedis = async () => {
    if (!exports.redisClient.isOpen) {
        await exports.redisClient.connect();
    }
};
exports.connectRedis = connectRedis;
