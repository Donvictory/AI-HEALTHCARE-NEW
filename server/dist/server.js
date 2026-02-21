"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app_config_1 = __importDefault(require("./config/app.config"));
const db_config_1 = __importDefault(require("./config/db.config"));
const redis_config_1 = require("./config/redis.config");
const startServer = async () => {
    try {
        // 1. Connect to Database
        await (0, db_config_1.default)();
        // 2. Connect to Redis (Caching Engine)
        await (0, redis_config_1.connectRedis)();
        // 3. Start Server
        app_1.default.listen(app_config_1.default.port, () => {
            console.log(`Server running in ${app_config_1.default.env} mode on port ${app_config_1.default.port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
